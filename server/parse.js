// The model's reply is untrusted text. Accept only a small, clean {name, strength}.

const MAX_NAME = 60
const MAX_STRENGTH = 24

/** Remove control characters and collapse whitespace; null if nothing is left. */
function cleanField(value, maxLength) {
  if (typeof value !== 'string') return null
  // eslint-disable-next-line no-control-regex
  const s = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  return s ? s.slice(0, maxLength) : null
}

/** Pulls the first {...} block out of replies like "```json\n{...}\n```" or "Sure! {...}". */
function firstJsonObject(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  const raw = text.slice(start, end + 1)
  // The prompt itself shows {name: null}, so models sometimes copy unquoted keys.
  const quotedKeys = raw.replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
  for (const candidate of [raw, quotedKeys]) {
    try {
      const value = JSON.parse(candidate)
      if (value && typeof value === 'object' && !Array.isArray(value)) return value
    } catch { /* try the next form */ }
  }
  return null
}

/**
 * @param {string} reply raw model output
 * @returns {{name: string, strength: string|null} | null} null = unreadable or junk
 */
export function parseModelReply(reply) {
  if (typeof reply !== 'string') return null
  const obj = firstJsonObject(reply)
  if (!obj) return null

  const name = cleanField(obj.name, MAX_NAME)
  if (!name || !/\p{L}{2,}/u.test(name)) return null // must contain an actual word

  let strength = cleanField(obj.strength, MAX_STRENGTH)
  if (strength && !/\d/.test(strength)) strength = null // a strength without a number is noise

  return { name, strength }
}
