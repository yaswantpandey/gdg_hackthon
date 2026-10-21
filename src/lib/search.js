// Brand / molecule search. Returns at most 3 candidates from OUR dataset, each
// with a 0..1 confidence. It never invents a drug: no match → empty array.
import Fuse from 'fuse.js'
import { parseQuery, nameOnly, normaliseText, numbersIn } from './normalise.js'
import { wordSimilarity } from './phonetic.js'

export const MIN_CONFIDENCE = 0.55
const MAX_RESULTS = 3

// A brand-name hit is more specific than a molecule hit.
const KIND_WEIGHT = { brand: 1, alias: 0.95, molecule: 0.85 }
const PHONETIC_WEIGHT = 0.85 // sound-alike matches are trusted a bit less

/** One searchable row per name a drug can be called by. */
function buildRecords(drugs) {
  return drugs.flatMap((drug, i) => {
    const rows = [{ i, kind: 'brand', text: nameOnly(drug.brandName) }]
    for (const a of drug.aliases ?? []) rows.push({ i, kind: 'alias', text: nameOnly(a) })
    rows.push({ i, kind: 'molecule', text: normaliseText(drug.molecule) })
    return rows.filter((r) => r.text)
  })
}

/** Typed "625" and the drug has 625 in its name/strength → boost; none of the numbers fit → penalty. */
function strengthAdjustment(queryNumbers, drug) {
  if (!queryNumbers.length) return 0
  const have = new Set(numbersIn(`${drug.brandName} ${drug.strength}`))
  const hits = queryNumbers.filter((n) => have.has(n)).length
  if (hits === queryNumbers.length) return 0.1
  return hits === 0 ? -0.2 : 0
}

/** Average best word-to-word similarity, for when Fuse finds nothing. */
function phoneticScore(queryName, recordText) {
  const qWords = queryName.split(' ').filter((w) => w.length >= 3)
  const tWords = recordText.split(' ')
  if (!qWords.length) return 0
  const total = qWords.reduce((sum, q) => sum + Math.max(...tWords.map((t) => wordSimilarity(q, t))), 0)
  return total / qWords.length
}

export function createSearch(drugs) {
  const records = buildRecords(drugs)
  const fuse = new Fuse(records, {
    keys: ['text'],
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    minMatchCharLength: 2,
  })

  /** Keeps the best confidence per drug. */
  function collect(scored, numbers) {
    const best = new Map()
    for (const { record, base, method } of scored) {
      const drug = drugs[record.i]
      const confidence = Math.min(1, base + strengthAdjustment(numbers, drug))
      const prev = best.get(record.i)
      if (!prev || confidence > prev.confidence) {
        best.set(record.i, { drug, confidence, matchedOn: record.kind, method })
      }
    }
    return [...best.values()]
      .filter((c) => c.confidence >= MIN_CONFIDENCE)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, MAX_RESULTS)
      .map((c) => ({ ...c, confidence: Math.round(c.confidence * 100) / 100 }))
  }

  /**
   * @param {string} input raw text the user typed or the scan read
   * @returns {{drug, confidence:number, matchedOn:'brand'|'alias'|'molecule', method:'fuzzy'|'phonetic'}[]}
   */
  return function search(input) {
    const { name, numbers } = parseQuery(input)
    if (name.replace(/\s/g, '').length < 3) return []

    const fuzzy = fuse.search(name).map(({ item, score }) => ({
      record: item, base: (1 - score) * KIND_WEIGHT[item.kind], method: 'fuzzy',
    }))
    const found = collect(fuzzy, numbers)
    if (found.length) return found

    const sounds = records.map((record) => ({
      record, base: phoneticScore(name, record.text) * KIND_WEIGHT[record.kind] * PHONETIC_WEIGHT, method: 'phonetic',
    }))
    return collect(sounds, numbers)
  }
}
