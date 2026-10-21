import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSearch } from '../src/lib/search.js'
import { parseQuery } from '../src/lib/normalise.js'
import { phoneticKey } from '../src/lib/phonetic.js'

const { drugs } = JSON.parse(readFileSync(new URL('./fixtures/search-fixture.json', import.meta.url), 'utf8'))
const search = createSearch(drugs)
const topId = (q) => search(q)[0]?.drug.id

test('normalises spacing, case and units', () => {
  assert.deepEqual(parseQuery('DOLO650 tab.'), { text: 'dolo 650 tab', name: 'dolo', numbers: [650] })
  assert.deepEqual(parseQuery('Augmentin 625mg').numbers, [625])
  assert.equal(parseQuery('Augmentin, 625 mg!').name, 'augmentin')
})

test('phonetic key treats common misspellings as the same sound', () => {
  assert.equal(phoneticKey('paracetamol'), phoneticKey('parasetmol'))
})

test('"Pantocid" → Pantocid 40', () => {
  assert.equal(topId('Pantocid'), 't-pantocid-40')
})

test('"Augmentin 625" → 625 Duo ranked above 375', () => {
  const ids = search('Augmentin 625').map((r) => r.drug.id)
  assert.equal(ids[0], 't-augmentin-625')
  assert.ok(!ids.includes('t-augmentin-375') || ids.indexOf('t-augmentin-375') > 0)
})

test('"Dolo650" (no space) → Dolo 650', () => {
  assert.equal(topId('Dolo650'), 't-dolo-650')
})

test('"Calpol" → Calpol 500', () => {
  assert.equal(topId('Calpol'), 't-calpol-500')
})

test('"paracetmol" (typo) → paracetamol brands, matched on molecule', () => {
  const results = search('paracetmol')
  assert.ok(results.length > 0 && results.length <= 3)
  assert.ok(results.every((r) => r.drug.molecule === 'Paracetamol'))
  assert.equal(results[0].matchedOn, 'molecule')
})

test('"azithral 500" → Azithral 500, not 250', () => {
  assert.equal(topId('azithral 500'), 't-azithral-500')
})

test('half-read and sound-alike words still match', () => {
  assert.equal(topId('pantoc'), 't-pantocid-40')
  assert.equal(topId('pantosid'), 't-pantocid-40')
  assert.equal(topId('agmentin'), 't-augmentin-625')
})

test('phonetic fallback catches spellings Fuse misses', () => {
  const [top] = search('oogmenteen')
  assert.equal(top.drug.id, 't-augmentin-625')
  assert.equal(top.method, 'phonetic')
})

test('Hindi alias → brand', () => {
  assert.equal(topId('डोलो'), 't-dolo-650')
})

test('returns at most 3 results with confidence in 0..1, best first', () => {
  const results = search('paracetamol')
  assert.ok(results.length <= 3)
  for (const r of results) assert.ok(r.confidence > 0 && r.confidence <= 1)
  assert.deepEqual(results.map((r) => r.confidence), results.map((r) => r.confidence).toSorted((a, b) => b - a))
})

test('gibberish and empty input return nothing', () => {
  for (const q of ['xqzvbnm', 'asdfghjkl', 'qwrtpl', 'xyzpol', 'blorbex', 'zzzz', '!!!', '', '   ', '12345', 'ab']) {
    assert.deepEqual(search(q), [], `expected no match for "${q}"`)
  }
})
