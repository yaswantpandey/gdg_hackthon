// Checks the actual bytes, not the Content-Type header the client claims.

const SIGNATURES = [
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', test: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
]

export const ACCEPTED_TYPES = SIGNATURES.map((s) => s.mime)

/** Returns the real image MIME type, or null if the bytes are not a JPEG/PNG/WebP. */
export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  return SIGNATURES.find((s) => s.test(buffer))?.mime ?? null
}
