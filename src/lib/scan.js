// Photo → {name, strength} text via our proxy. The text is only a search query:
// every drug fact still comes from the dataset through search().

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const MAX_SIDE = 1280 // enough to read a strip; a 4 MB photo becomes ~200 KB on bad signal
const TIMEOUT_MS = 70_000
const MAX_INPUT_BYTES = 25_000_000 // decoding a bigger file could crash a cheap phone's browser

/** Defence in depth: the proxy already cleans the model's text; check again before using it. */
// eslint-disable-next-line no-control-regex
const cleanText = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) : '')

/**
 * Shrinks and re-encodes the photo as JPEG. Re-encoding through a canvas also
 * drops EXIF metadata (GPS location, phone model) before anything leaves the phone.
 */
export async function shrinkPhoto(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.82))
}

/**
 * @returns {Promise<{ok: true, query: string} | {ok: false, reason: string}>}
 * Never throws: every failure becomes a reason the UI can explain.
 */
export async function scanPhoto(file, signal) {
  if (!navigator.onLine) return { ok: false, reason: 'offline' }
  if (!file.type.startsWith('image/') || file.size > MAX_INPUT_BYTES) return { ok: false, reason: 'bad_type' }
  let body
  try {
    body = await shrinkPhoto(file)
  } catch {
    return { ok: false, reason: 'bad_type' } // e.g. HEIC the browser cannot decode
  }
  try {
    const res = await fetch(`${API_BASE}/api/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body,
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)].filter(Boolean)),
    })
    const data = await res.json().catch(() => ({}))
    if (!data.ok) return { ok: false, reason: data.reason ?? 'unavailable' }
    // Untrusted text: it only ever becomes the value of the editable search box (never HTML,
    // never a URL), and search() then accepts it only if it matches our dataset.
    const query = [cleanText(data.name), cleanText(data.strength)].filter(Boolean).join(' ')
    return query ? { ok: true, query } : { ok: false, reason: 'unreadable' }
  } catch (e) {
    if (e.name === 'AbortError' && signal?.aborted) return { ok: false, reason: 'cancelled' }
    return { ok: false, reason: e.name === 'TimeoutError' ? 'timeout' : 'unavailable' }
  }
}
