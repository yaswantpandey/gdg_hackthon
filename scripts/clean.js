#!/usr/bin/env node
// Converts a raw CSV into src/data/drugs.json format, then validates it.
// Usage: node scripts/clean.js <raw.csv> [out.json] --source "PMBJP product list" [--date 2026-10-21]
//
// It only reshapes and tidies what is in the CSV. It never fills in a missing
// price or name: incomplete rows are dropped and reported.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { validateDataset } from './validate.js'

// Accepted header spellings → schema field. Headers are matched case-insensitively,
// ignoring spaces, underscores, dots and the ₹ sign.
const HEADERS = {
  brandName: ['brandname', 'brand', 'name', 'productname'],
  aliases: ['aliases', 'alias', 'othernames'],
  molecule: ['molecule', 'salt', 'composition', 'activeingredient'],
  strength: ['strength', 'dose', 'dosage'],
  form: ['form', 'dosageform', 'type'],
  packSize: ['packsize', 'pack', 'unitsperpack', 'qty'],
  brandPriceInr: ['brandpriceinr', 'brandprice', 'mrp', 'brandmrp'],
  genericName: ['genericname', 'generic'],
  janAushadhiPriceInr: ['janaushadhipriceinr', 'janaushadhiprice', 'japrice', 'genericprice', 'pmbjpprice'],
  janAushadhiPackSize: ['janaushadhipacksize', 'japacksize', 'genericpacksize'],
  nppaCeilingPriceInr: ['nppaceilingpriceinr', 'nppaceilingprice', 'ceilingprice', 'nppaprice'],
  source: ['source', 'sourceurl'],
  lastUpdated: ['lastupdated', 'date', 'updated'],
}

const headerKey = (h) => h.toLowerCase().replace(/[\s_.₹()-]/g, '')

/** Minimal RFC 4180 CSV parser: handles quotes, escaped quotes and CRLF. */
export function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  text = text.replace(/^﻿/, '') // strip BOM from Excel exports
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((f) => f.trim()))
}

const tidy = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

/** "₹1,240.50" → 1240.5 ; "" / "NA" → null */
function toPrice(s) {
  const t = tidy(s).replace(/₹|rs\.?|inr|,/gi, '').trim()
  if (!t || /^(na|n\/a|-|nil)$/i.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
}

/** "500MG" → "500 mg", "0.5 Mg/ML" → "0.5 mg/ml" */
const toStrength = (s) => tidy(s).toLowerCase().replace(/(\d)\s*(mg|mcg|g|ml|iu|%)/g, '$1 $2')

/** "Tab." / "Tablets" → "tablet", "Cap" → "capsule" */
function toForm(s) {
  const t = tidy(s).toLowerCase()
  if (/^tab/.test(t)) return 'tablet'
  if (/^cap/.test(t)) return 'capsule'
  if (/^(syr|syp)/.test(t)) return 'syrup'
  if (/^inj/.test(t)) return 'injection'
  return t
}

const slug = (...parts) =>
  parts.join(' ').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function cleanRows(rows, { source, date }) {
  const [header, ...body] = rows
  const col = {}
  header.forEach((h, i) => {
    const k = headerKey(h)
    for (const [field, names] of Object.entries(HEADERS)) if (names.includes(k)) col[field] = i
  })

  const drugs = [], dropped = [], seen = new Set()
  body.forEach((r, i) => {
    const line = i + 2 // 1-based, plus header
    const get = (f) => (col[f] === undefined ? '' : r[col[f]])

    const d = {
      brandName: tidy(get('brandName')),
      aliases: tidy(get('aliases')).split(/[|;]/).map(tidy).filter(Boolean),
      molecule: tidy(get('molecule')),
      strength: toStrength(get('strength')),
      form: toForm(get('form')),
      packSize: parseInt(tidy(get('packSize')), 10),
      brandPriceInr: toPrice(get('brandPriceInr')),
      genericName: tidy(get('genericName')),
      janAushadhiPriceInr: toPrice(get('janAushadhiPriceInr')),
      nppaCeilingPriceInr: toPrice(get('nppaCeilingPriceInr')),
      source: tidy(get('source')) || source,
      lastUpdated: tidy(get('lastUpdated')) || date,
    }

    // If the generic pack is a different size, scale its price to the brand pack
    // so both prices compare the same number of units. Derived, not invented.
    const jaPack = parseInt(tidy(get('janAushadhiPackSize')), 10)
    if (jaPack > 0 && d.packSize > 0 && jaPack !== d.packSize && d.janAushadhiPriceInr > 0) {
      d.janAushadhiPriceInr = Math.round((d.janAushadhiPriceInr / jaPack) * d.packSize * 100) / 100
    }

    const missing = ['brandName', 'molecule', 'strength', 'form', 'genericName', 'source']
      .filter((f) => !d[f])
    if (!(d.packSize > 0)) missing.push('packSize')
    if (!(d.brandPriceInr > 0)) missing.push('brandPriceInr')
    if (!(d.janAushadhiPriceInr > 0)) missing.push('janAushadhiPriceInr')
    if (missing.length) return dropped.push(`line ${line}: missing/invalid ${missing.join(', ')}`)
    if (Number.isNaN(d.nppaCeilingPriceInr)) return dropped.push(`line ${line}: bad NPPA price`)
    if (d.janAushadhiPriceInr >= d.brandPriceInr) {
      return dropped.push(`line ${line}: generic not cheaper than brand (no saving to show)`)
    }

    d.id = slug(d.brandName, d.form)
    if (seen.has(d.id)) return dropped.push(`line ${line}: duplicate of ${d.id}`)
    seen.add(d.id)

    // Keep schema field order stable for readable diffs.
    const { id, ...rest } = d
    drugs.push({ id, ...rest })
  })

  return { drugs, dropped }
}

function main() {
  const args = process.argv.slice(2)
  const flag = (name) => {
    const i = args.indexOf(name)
    return i === -1 ? undefined : args.splice(i, 2)[1]
  }
  const source = flag('--source')
  const date = flag('--date') ?? new Date().toISOString().slice(0, 10)
  const [input, output = 'src/data/drugs.json'] = args

  if (!input || !source) {
    console.error('Usage: node scripts/clean.js <raw.csv> [out.json] --source "<where the data came from>" [--date YYYY-MM-DD]')
    process.exit(1)
  }

  const { drugs, dropped } = cleanRows(parseCsv(readFileSync(input, 'utf8')), { source, date })
  const dataset = {
    meta: {
      schemaVersion: 1,
      isSample: false,
      note: `Cleaned from ${input} by scripts/clean.js.`,
      currency: 'INR',
      priceBasis: 'brandPriceInr, janAushadhiPriceInr and nppaCeilingPriceInr are all for one pack of packSize units.',
      lastUpdated: date,
    },
    drugs,
  }

  dropped.forEach((m) => console.warn(`⚠ dropped ${m}`))
  const { errors } = validateDataset(dataset)
  if (errors.length) {
    errors.forEach((e) => console.error(`✖ ${e}`))
    console.error('Not written: fix the CSV and try again.')
    process.exit(1)
  }
  writeFileSync(output, JSON.stringify(dataset, null, 2) + '\n')
  console.log(`✔ wrote ${drugs.length} drugs to ${output} (${dropped.length} dropped)`)
}

// CLI entry point
if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
