// Guards against the mistakes most likely in a hackathon repo.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('.env.example never contains a real API key', () => {
  assert.match(read('.env.example'), /^GEMMA_API_KEY=\s*$/m)
})

test('.env is git-ignored', () => {
  assert.match(read('.gitignore'), /^\.env$/m)
})

test('no tracked file contains something that looks like an API key', () => {
  let hits = ''
  try {
    hits = execSync(String.raw`git grep -nIE "AIza[0-9A-Za-z_-]{30,}|AQ\.[A-Za-z0-9_-]{30,}|sk-[A-Za-z0-9]{30,}" -- . ":!package-lock.json"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch { /* git grep exits 1 when nothing matches */ }
  assert.equal(hits.trim(), '')
})

test('frontend never uses raw-HTML sinks', () => {
  const files = execSync('git ls-files src', { encoding: 'utf8' }).split('\n').filter((f) => /\.jsx?$/.test(f))
  for (const f of files) assert.doesNotMatch(read(f), /dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(/, f)
})
