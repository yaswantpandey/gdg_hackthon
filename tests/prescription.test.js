import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanItems, prescriptionTotals } from '../src/lib/prescription.js'

const drugs = [
  { id: 'a', brandPriceInr: 240, janAushadhiPriceInr: 28 },
  { id: 'b', brandPriceInr: 30, janAushadhiPriceInr: 10 },
  { id: 'c', brandPriceInr: 10.1, janAushadhiPriceInr: 3.3 },
]

test('sums brand, generic and saving across medicines and packs', () => {
  const t = prescriptionTotals([{ drugId: 'a', packs: 1 }, { drugId: 'b', packs: 2 }], drugs)
  assert.equal(t.brand, 300)
  assert.equal(t.generic, 48)
  assert.equal(t.saved, 252)
  assert.equal(t.percent, 84)
  assert.deepEqual(t.lines.map((l) => [l.drug.id, l.brand, l.generic]), [['a', 240, 28], ['b', 60, 20]])
})

test('no float noise with paise', () => {
  const t = prescriptionTotals([{ drugId: 'c', packs: 3 }], drugs)
  assert.deepEqual([t.brand, t.generic, t.saved], [30.3, 9.9, 20.4])
})

test('a drug that left the dataset is reported, not priced', () => {
  const t = prescriptionTotals([{ drugId: 'gone', packs: 1 }, { drugId: 'b', packs: 1 }], drugs)
  assert.deepEqual(t.missing, ['gone'])
  assert.equal(t.brand, 30)
})

test('empty list → zeros, no divide-by-zero', () => {
  assert.deepEqual(prescriptionTotals([], drugs), { lines: [], missing: [], brand: 0, generic: 0, saved: 0, percent: 0 })
})

test('cleanItems drops junk from storage and caps packs', () => {
  const dirty = [{ drugId: 'a', packs: 2 }, { drugId: 'a', packs: 5 }, { drugId: 'b', packs: 0 }, null, { drugId: 7, packs: 1 },
    { drugId: 'c', packs: 999 }]
  assert.deepEqual(cleanItems(dirty), [{ drugId: 'a', packs: 2 }, { drugId: 'c', packs: 20 }])
  assert.deepEqual(cleanItems('nonsense'), [])
})
