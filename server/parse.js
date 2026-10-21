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

/** Parses one {...} block; the prompt itself shows {name: null}, so also try with keys quoted. */
function tryParse(raw) {
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
 * Returns the first parseable top-level {...} block, so chatter like
 * "I'll reply {name, strength}… ```json {"name": …}```" still works.
 */
function firstJsonObject(text) {
  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++
      else if (text[i] === '}' && --depth === 0) {
        const value = tryParse(text.slice(start, i + 1))
        if (value) return value
        break
      }
    }
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
