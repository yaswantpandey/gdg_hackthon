// Sends one image to Gemma 4 and returns the raw text reply. Nothing is stored or logged.

export const PROMPT =
  'Read only the printed medicine name and strength visible in the image. ' +
  'Reply as JSON {name, strength}. If unreadable reply {name: null}.'

export class ModelError extends Error {
  constructor(reason, message) {
    super(message)
    this.reason = reason // 'timeout' | 'model_unavailable'
  }
}

async function post(url, body, headers, timeoutMs) {
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (e) {
    const reason = e.name === 'TimeoutError' ? 'timeout' : 'model_unavailable'
    throw new ModelError(reason, `Model request failed: ${e.name}`)
  }
  if (!res.ok) throw new ModelError('model_unavailable', `Model returned HTTP ${res.status}`)
  return res.json()
}

/** Local Gemma via Ollama (https://ollama.com). */
async function askOllama(image, _mime, config) {
  const data = await post(`${config.ollamaUrl}/api/chat`, {
    model: config.model,
    messages: [{ role: 'user', content: PROMPT, images: [image.toString('base64')] }],
    format: 'json',
    stream: false,
    think: false,
    keep_alive: '30m', // keep the model loaded between scans
    options: { temperature: 0 },
  }, {}, config.timeoutMs)
  return data?.message?.content ?? ''
}

/** Hosted Gemma via the Gemini API (Google AI Studio key). */
async function askHosted(image, mime, config) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`
  const data = await post(url, {
    contents: [{ parts: [{ inline_data: { mime_type: mime, data: image.toString('base64') } }, { text: PROMPT }] }],
    generationConfig: { temperature: 0 },
  }, { 'x-goog-api-key': config.apiKey }, config.timeoutMs)
  return (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('')
}

/** Returns a function (imageBuffer, mime) → raw reply text, for the configured provider. */
export function createGemma(config) {
  const ask = config.provider === 'hosted' ? askHosted : askOllama
  return (image, mime) => ask(image, mime, config)
}
