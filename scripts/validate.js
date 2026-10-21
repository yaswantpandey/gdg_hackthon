#!/usr/bin/env node
// Validates the drug dataset. Usage: node scripts/validate.js [path/to/drugs.json]
// Exits 1 on any error so it can gate commits and CI.
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const REQUIRED_STRINGS = [
  'id', 'brandName', 'molecule', 'strength', 'form', 'genericName', 'source', 'lastUpdated',
]
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isPositiveNumber = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ')

/** Returns { errors: string[], warnings: string[] } for a parsed dataset. */
export function validateDataset(data) {
  const errors = []
  const warnings = []

  if (!data || typeof data !== 'object' || !Array.isArray(data.drugs)) {
    return { errors: ['Top level must be an object with a "drugs" array.'], warnings }
  }
  if (data.meta?.isSample) warnings.push('Dataset is marked isSample: these are NOT real prices.')

  const ids = new Map()
  const products = new Map()
  const aliasOwner = new Map()

  data.drugs.forEach((d, i) => {
    const where = `drugs[${i}]${d?.id ? ` (${d.id})` : ''}`
    const err = (msg) => errors.push(`${where}: ${msg}`)

    for (const f of REQUIRED_STRINGS) {
      if (typeof d[f] !== 'string' || !d[f].trim()) err(`"${f}" must be a non-empty string`)
    }
    if (d.lastUpdated && !ISO_DATE.test(d.lastUpdated)) err('"lastUpdated" must be YYYY-MM-DD')

    if (!Array.isArray(d.aliases) || d.aliases.some((a) => typeof a !== 'string' || !a.trim())) {
      err('"aliases" must be an array of non-empty strings')
    }
    if (!Number.isInteger(d.packSize) || d.packSize <= 0) err('"packSize" must be a positive integer')

    if (!isPositiveNumber(d.brandPriceInr)) err('"brandPriceInr" must be a positive number')
    if (!isPositiveNumber(d.janAushadhiPriceInr)) err('"janAushadhiPriceInr" must be a positive number')
    if (d.nppaCeilingPriceInr !== null && !isPositiveNumber(d.nppaCeilingPriceInr)) {
      err('"nppaCeilingPriceInr" must be a positive number or null')
    }

    if (isPositiveNumber(d.brandPriceInr) && isPositiveNumber(d.janAushadhiPriceInr)
        && d.janAushadhiPriceInr >= d.brandPriceInr) {
      err(`generic price ₹${d.janAushadhiPriceInr} is not lower than brand price ₹${d.brandPriceInr}`)
    }

    // Duplicates: same id, or the same brand + strength + form twice.
    if (d.id) {
      if (ids.has(d.id)) err(`duplicate id (also at drugs[${ids.get(d.id)}])`)
      else ids.set(d.id, i)
    }
    const productKey = [d.brandName, d.strength, d.form].map(norm).join('|')
    if (products.has(productKey)) err(`duplicate product (also at drugs[${products.get(productKey)}])`)
    else products.set(productKey, i)

    // An alias pointing at two different drugs would make search ambiguous.
    for (const name of [d.brandName, ...(d.aliases ?? [])]) {
      if (typeof name !== 'string') continue
      const key = norm(name)
      const owner = aliasOwner.get(key)
      if (owner && owner !== d.id) warnings.push(`${where}: name "${name}" also used by ${owner}`)
      else aliasOwner.set(key, d.id)
    }
  })

  return { errors, warnings }
}

// CLI entry point
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
  const file = process.argv[2] ?? path.join(root, 'src', 'data', 'drugs.json')

  let data
  try {
    // Strip the BOM that Windows editors add, or JSON.parse rejects the file.
    data = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''))
  } catch (e) {
    console.error(`✖ Could not read ${file}: ${e.message}`)
    process.exit(1)
  }

  const { errors, warnings } = validateDataset(data)
  warnings.forEach((w) => console.warn(`⚠ ${w}`))
  errors.forEach((e) => console.error(`✖ ${e}`))
  if (errors.length) {
    console.error(`\n${errors.length} error(s) in ${file}`)
    process.exit(1)
  }
  console.log(`✔ ${data.drugs.length} drugs valid in ${file}`)
}
