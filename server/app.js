// The OCR proxy: one image in, {name, strength} text out.
// Images live only in memory for the length of the request: no disk, no logs.
import express from 'express'
import rateLimit from 'express-rate-limit'
import { ACCEPTED_TYPES, detectImageType } from './image.js'
import { parseModelReply } from './parse.js'

const fail = (res, status, reason) => res.status(status).json({ ok: false, reason })

/**
 * @param {object} config see server/index.js
 * @param {(image: Buffer, mime: string) => Promise<string>} askModel
 */
export function createApp(config, askModel) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy) // so rate limiting sees real client IPs behind a proxy

  // Metadata-only access log: method, path, status, time. Never the body, never the IP.
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`))
    next()
  })

  // CORS for a deployed frontend on another origin; same-origin dev uses the Vite proxy.
  app.use((req, res, next) => {
    const origin = req.get('origin')
    if (origin && config.allowedOrigins.includes(origin)) {
      res.set({ 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Headers': 'Content-Type' })
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.get('/api/health', (_req, res) => res.json({ ok: true, provider: config.provider }))

  const limiter = rateLimit({
    windowMs: 60_000,
    limit: config.ratePerMin,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => fail(res, 429, 'rate_limited'),
  })

  let inFlight = 0 // a small laptop can only run a few model calls at once

  app.post(
    '/api/ocr',
    limiter,
    express.raw({ type: ACCEPTED_TYPES, limit: config.maxImageBytes }),
    async (req, res) => {
      const image = req.body
      if (!Buffer.isBuffer(image) || image.length === 0) return fail(res, 415, 'bad_type')
      const mime = detectImageType(image)
      if (!mime) return fail(res, 415, 'bad_type')
      if (inFlight >= config.maxConcurrent) return fail(res, 503, 'busy')

      inFlight++
      try {
        const text = parseModelReply(await askModel(image, mime))
        return text ? res.json({ ok: true, ...text }) : fail(res, 422, 'unreadable')
      } catch (e) {
        console.error(`ocr failed: ${e.reason ?? 'error'}`) // reason only; the message could echo data
        return fail(res, e.reason === 'timeout' ? 504 : 502, e.reason ?? 'model_unavailable')
      } finally {
        inFlight--
      }
    },
  )

  // Body-parser errors (e.g. image too big) → the same small JSON shape.
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.too.large') return fail(res, 413, 'too_large')
    console.error(`request error: ${err.type ?? err.name}`)
    return fail(res, 400, 'bad_request')
  })

  return app
}
