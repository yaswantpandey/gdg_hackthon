// Starts the OCR proxy. Config comes from .env (see .env.example).
// Run: npm run server
import { createApp } from './app.js'
import { createGemma } from './gemma.js'

const env = process.env
const provider = env.GEMMA_PROVIDER === 'hosted' ? 'hosted' : 'ollama'

const config = {
  port: Number(env.PORT) || 8787,
  provider,
  model: env.GEMMA_MODEL || (provider === 'hosted' ? 'gemma-4-26b-a4b-it' : 'gemma4:e2b'),
  ollamaUrl: env.OLLAMA_URL || 'http://localhost:11434',
  apiKey: env.GEMMA_API_KEY || '',
  thinking: env.GEMMA_THINKING ?? 'minimal', // hosted only; set empty to let the model think
  timeoutMs: Number(env.OCR_TIMEOUT_MS) || 60_000, // first local call also loads the model
  maxImageBytes: Number(env.MAX_IMAGE_BYTES) || 2_000_000,
  ratePerMin: Number(env.RATE_LIMIT_PER_MIN) || 10,
  maxConcurrent: Number(env.MAX_CONCURRENT) || 2,
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: env.TRUST_PROXY === '1' ? 1 : false,
}

if (provider === 'hosted' && !config.apiKey) {
  console.error('GEMMA_PROVIDER=hosted needs GEMMA_API_KEY in .env')
  process.exit(1)
}

createApp(config, createGemma(config)).listen(config.port, () => {
  console.log(`OCR proxy on http://localhost:${config.port} · ${provider} · ${config.model}`)
})
