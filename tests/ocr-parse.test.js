import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseModelReply } from '../server/parse.js'
import { detectImageType } from '../server/image.js'

test('clean JSON', () => {
  assert.deepEqual(parseModelReply('{"name":"Augmentin 625 Duo","strength":"500 mg + 125 mg"}'),
    { name: 'Augmentin 625 Duo', strength: '500 mg + 125 mg' })
})

test('JSON wrapped in a code fence or chatter', () => {
  assert.deepEqual(parseModelReply('Sure! ```json\n{"name": "Dolo 650", "strength": "650mg"}\n```'),
    { name: 'Dolo 650', strength: '650mg' })
})

test('skips chatter that contains braces before the real JSON', () => {
  const reply = 'The prompt wants {name, strength}. Here: ```json\n{"name": "Democillin", "strength": "500 mg"}\n```'
  assert.deepEqual(parseModelReply(reply), { name: 'Democillin', strength: '500 mg' })
})

test('unquoted keys, as in the prompt example', () => {
  assert.deepEqual(parseModelReply('{name: "Pantocid 40", strength: "40 mg"}'), { name: 'Pantocid 40', strength: '40 mg' })
})

test('unreadable → null', () => {
  assert.equal(parseModelReply('{"name": null}'), null)
  assert.equal(parseModelReply('{name: null}'), null) // the prompt's own non-strict JSON
})

test('junk, non-JSON and wrong shapes → null', () => {
  for (const reply of ['', 'I cannot read this', '[1,2]', '{"name": 42}', '{"name": "  "}', '{"name": "???"}', null]) {
    assert.equal(parseModelReply(reply), null, String(reply))
  }
})

test('strips control characters, caps length, drops a strength with no number', () => {
  const r = parseModelReply(JSON.stringify({ name: `Pan\u0007 40${'x'.repeat(200)}`, strength: 'strong' }))
  assert.ok(r.name.startsWith('Pan 40'))
  assert.ok(r.name.length <= 60)
  assert.equal(r.strength, null)
})

test('image type comes from the bytes, not the header', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  assert.equal(detectImageType(jpeg), 'image/jpeg')
  assert.equal(detectImageType(png), 'image/png')
  assert.equal(detectImageType(Buffer.from('<svg onload=alert(1)>....')), null)
  assert.equal(detectImageType(Buffer.from('%PDF-1.7 not an image')), null)
})
