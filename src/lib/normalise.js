// Turns messy user input ("DOLO650 tab.", "Augmentin 625mg", "डोलो") into
// a clean name plus any strength numbers, so matching sees the same shape every time.

const UNITS = new Set(['mg', 'mgs', 'mcg', 'ug', 'g', 'gm', 'ml', 'iu'])

// Words that describe the pack, not the medicine. Dropped from the name.
const FILLER = new Set([
  'tab', 'tabs', 'tablet', 'tablets', 'cap', 'caps', 'capsule', 'capsules',
  'strip', 'strips', 'of', 'ip', 'bp', 'usp',
])

/** Lowercase, strip punctuation, and split "dolo650" → "dolo 650", "625mg" → "625 mg". */
export function normaliseText(input) {
  return String(input ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')        // keep the dot only inside "0.5"
    .replace(/[^\p{L}\p{M}\p{N}.\s]/gu, ' ')    // \p{M} keeps Hindi vowel signs
    .replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/(\d)(\p{L})/gu, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

/** All numbers in a string: "500 mg + 125 mg" → [500, 125]. */
export const numbersIn = (s) => (normaliseText(s).match(/\d+(\.\d+)?/g) ?? []).map(Number)

/** Same as normaliseText, minus numbers and units: "Augmentin 625 Duo" → "augmentin duo". */
export const nameOnly = (s) =>
  normaliseText(s).split(' ').filter((t) => !/^\d/.test(t) && !UNITS.has(t) && !FILLER.has(t)).join(' ')

/** Splits a query into { name, numbers }. */
export function parseQuery(input) {
  const text = normaliseText(input)
  return { text, name: nameOnly(text), numbers: numbersIn(text) }
}
