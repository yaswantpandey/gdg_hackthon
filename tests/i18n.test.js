import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { makeT } from '../src/i18n/index.js'

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'))
const hi = load('hi')
const en = load('en')
const placeholders = (s) => (String(s).match(/\{\w+\}/g) ?? []).sort()

test('hi and en have exactly the same keys', () => {
  assert.deepEqual(Object.keys(hi).sort(), Object.keys(en).sort())
  assert.deepEqual(Object.keys(hi.forms).sort(), Object.keys(en.forms).sort())
})

test('every translation keeps the same {placeholders}', () => {
  for (const key of Object.keys(en)) {
    if (typeof en[key] === 'string') assert.deepEqual(placeholders(hi[key]), placeholders(en[key]), key)
  }
})

test('the English disclaimer is word-for-word the required text', () => {
  assert.equal(en.disclaimer, 'Price and molecule information only, not medical advice. Confirm with your doctor or pharmacist.')
})

test('t() fills placeholders and falls back to the key', () => {
  const t = makeT('en')
  assert.equal(t('percentCheaper', { percent: 88 }), '88% cheaper')
  assert.equal(t('noSuchKey'), 'noSuchKey')
  assert.equal(makeT('hi').form('tablet'), 'गोली')
})
