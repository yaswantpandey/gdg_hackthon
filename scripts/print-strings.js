#!/usr/bin/env node
// Prints every Hindi string next to its English source for a native-speaker review.
// Usage: node scripts/print-strings.js > strings-review.md
import { readFileSync } from 'node:fs'

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'))
const hi = load('hi')
const en = load('en')

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]])

const enFlat = Object.fromEntries(flatten(en))
const cell = (s) => String(s).replace(/\|/g, '\\|')

console.log('| key | English | हिंदी |')
console.log('|---|---|---|')
for (const [key, value] of flatten(hi)) console.log(`| ${key} | ${cell(enFlat[key] ?? '')} | ${cell(value)} |`)
