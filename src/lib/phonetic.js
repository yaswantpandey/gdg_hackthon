// Fallbacks for half-read or misspelt words, used when Fuse finds nothing.

/**
 * Rough sound-alike key tuned for how Indian drug names get misspelt:
 * "paracetamol" and "parasetmol" both become "prstml".
 */
export function phoneticKey(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return ''
  const s = w
    .replace(/ph/g, 'f')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/z/g, 's')
    .replace(/w/g, 'v')
    .replace(/h/g, '')
  // Keep the first letter, drop later vowels, collapse doubles.
  return (s[0] + s.slice(1).replace(/[aeiouy]/g, '')).replace(/(.)\1+/g, '$1')
}

/** Optimal-string-alignment edit distance (Levenshtein + adjacent swaps). */
export function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

const editSimilarity = (a, b) => 1 - editDistance(a, b) / Math.max(a.length, b.length, 1)

/** 0..1 similarity between one query word and one dataset word. */
export function wordSimilarity(q, t) {
  if (q.length >= 4 && t.startsWith(q)) return 0.8 // half-read: "pantoc" → "pantocid"
  const kq = phoneticKey(q)
  const kt = phoneticKey(t)
  const sound = kq && kt ? (kq === kt ? 0.85 : editSimilarity(kq, kt) * 0.8) : 0
  return Math.max(editSimilarity(q, t), sound)
}
