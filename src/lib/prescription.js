// Totals for "My prescription". Items hold only {drugId, packs}; every price is looked up
// in the dataset at render time, so a data update fixes old lists too.

export const MAX_PACKS = 20
const round2 = (n) => Math.round(n * 100) / 100

/** Keeps only well-formed items from storage, one per drug. */
export function cleanItems(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  return value.filter((it) => {
    const ok = typeof it?.drugId === 'string' && Number.isInteger(it.packs) && it.packs >= 1 && !seen.has(it.drugId)
    if (ok) seen.add(it.drugId)
    return ok
  }).map(({ drugId, packs }) => ({ drugId, packs: Math.min(packs, MAX_PACKS) }))
}

/**
 * @returns {{ lines: {drug, packs, brand, generic}[], missing: string[],
 *             brand: number, generic: number, saved: number, percent: number }}
 */
export function prescriptionTotals(items, drugs) {
  const byId = new Map(drugs.map((d) => [d.id, d]))
  const lines = []
  const missing = []
  for (const { drugId, packs } of items) {
    const drug = byId.get(drugId)
    if (!drug) { missing.push(drugId); continue }
    lines.push({ drug, packs, brand: round2(drug.brandPriceInr * packs), generic: round2(drug.janAushadhiPriceInr * packs) })
  }
  const brand = round2(lines.reduce((s, l) => s + l.brand, 0))
  const generic = round2(lines.reduce((s, l) => s + l.generic, 0))
  const saved = round2(brand - generic)
  const percent = brand > 0 ? Math.floor((saved / brand) * 100) : 0 // rounded down, never overstated
  return { lines, missing, brand, generic, saved, percent }
}
