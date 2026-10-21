import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatInr, savingFor } from '../src/lib/price.js'

test('saving for ₹240 → ₹28', () => {
  assert.deepEqual(savingFor({ brandPriceInr: 240, janAushadhiPriceInr: 28 }), {
    brand: 240, generic: 28, saved: 212, percent: 88, // 88.33 rounded down, never overstated
  })
})

test('handles paise without float noise', () => {
  assert.equal(savingFor({ brandPriceInr: 10.1, janAushadhiPriceInr: 3.3 }).saved, 6.8)
})

test('formats rupees the Indian way', () => {
  assert.equal(formatInr(240), '₹240')
  assert.equal(formatInr(124050.5), '₹1,24,050.5')
})
