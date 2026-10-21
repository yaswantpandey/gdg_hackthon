import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/app.js'
import { ModelError } from '../server/gemma.js'

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(100)])
let reply = async () => '{"name":"Demostatin 10","strength":"10 mg"}'
let seen = []
let server, base

before(async () => {
  const config = {
    // 8/min: the tests before the rate-limit test make 7 requests (rejected ones count too).
    provider: 'test', maxImageBytes: 1000, ratePerMin: 8, maxConcurrent: 2,
    allowedOrigins: [], trustProxy: false,
  }
  const fakeModel = async (image, mime) => { seen.push({ size: image.length, mime }); return reply() }
  server = createApp(config, fakeModel).listen(0)
  await new Promise((r) => server.once('listening', r))
  base = `http://localhost:${server.address().port}`
})
after(() => server.close())

const ocr = (body, type = 'image/jpeg') =>
  fetch(`${base}/api/ocr`, { method: 'POST', headers: { 'Content-Type': type }, body })
    .then(async (r) => ({ status: r.status, json: await r.json() }))

test('valid photo → name and strength', async () => {
  const { status, json } = await ocr(JPEG)
  assert.equal(status, 200)
  assert.deepEqual(json, { ok: true, name: 'Demostatin 10', strength: '10 mg' })
  assert.deepEqual(seen.at(-1), { size: JPEG.length, mime: 'image/jpeg' })
})

test('too large → 413 too_large, model never called', async () => {
  const before = seen.length
  const { status, json } = await ocr(Buffer.concat([JPEG, Buffer.alloc(2000)]))
  assert.equal(status, 413)
  assert.equal(json.reason, 'too_large')
  assert.equal(seen.length, before)
})

test('wrong type → 415 bad_type (header lies or bytes lie)', async () => {
  assert.equal((await ocr(Buffer.from('hello'), 'text/plain')).json.reason, 'bad_type')
  assert.equal((await ocr(Buffer.alloc(50, 1), 'image/jpeg')).json.reason, 'bad_type')
})

test('model says unreadable → 422', async () => {
  reply = async () => '{"name": null}'
  assert.deepEqual((await ocr(JPEG)).json, { ok: false, reason: 'unreadable' })
})

test('model down or slow → friendly reason', async () => {
  reply = async () => { throw new ModelError('timeout', 'slow') }
  assert.deepEqual(await ocr(JPEG), { status: 504, json: { ok: false, reason: 'timeout' } })
  reply = async () => { throw new ModelError('model_unavailable', 'down') }
  assert.equal((await ocr(JPEG)).json.reason, 'model_unavailable')
})

test('API responses carry hardening headers', async () => {
  const res = await fetch(`${base}/api/health`)
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(res.headers.get('cache-control'), 'no-store')
  assert.match(res.headers.get('content-security-policy'), /default-src 'none'/)
  assert.equal(res.headers.get('x-powered-by'), null)
})

test('CORS: unknown origins get no allow header and a 403 preflight', async () => {
  const pre = await fetch(`${base}/api/ocr`, { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } })
  assert.equal(pre.status, 403)
  assert.equal(pre.headers.get('access-control-allow-origin'), null)
})

test('rate limit → 429 rate_limited', async () => {
  reply = async () => '{"name":"Demo"}'
  const statuses = []
  for (let i = 0; i < 4; i++) statuses.push((await ocr(JPEG)).status)
  assert.ok(statuses.includes(429), `got ${statuses}`)
  assert.equal((await ocr(JPEG)).json.reason, 'rate_limited')
})
