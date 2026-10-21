import { useRef, useState } from 'react'
import { scanPhoto } from './scan.js'

/**
 * Scan state machine: idle → reading → read | failed.
 * On success the read text goes into the search box via onText; the user can edit it.
 */
export function useScan(onText) {
  const [scan, setScan] = useState({ status: 'idle' })
  const controller = useRef(null)

  async function start(file) {
    controller.current?.abort() // a new photo replaces any scan still running
    const ac = new AbortController()
    controller.current = ac
    const previewUrl = URL.createObjectURL(file) // in-memory preview only
    setScan({ status: 'reading', previewUrl })

    const result = await scanPhoto(file, ac.signal)
    URL.revokeObjectURL(previewUrl)
    if (ac.signal.aborted) return

    if (result.ok) {
      onText(result.query)
      setScan({ status: 'read', text: result.query })
    } else {
      setScan({ status: 'failed', reason: result.reason })
    }
  }

  function cancel() {
    controller.current?.abort()
    setScan({ status: 'idle' })
  }

  return { scan, start, cancel, clear: () => setScan({ status: 'idle' }) }
}
