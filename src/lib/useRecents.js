import { useCallback, useState } from 'react'

const KEY = 'recentDrugIds'
const MAX = 5

// Recent searches store dataset ids only (never what was typed), so a chip always
// leads to a real entry and nothing personal is kept. localStorage: per-phone convenience.
function read() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string').slice(0, MAX) : []
  } catch { return [] }
}
function write(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* private mode: fine */ }
}

export function useRecents() {
  const [ids, setIds] = useState(read)
  const remember = useCallback((id) => setIds((prev) => {
    if (prev[0] === id) return prev
    const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX)
    write(next)
    return next
  }), [])
  const clear = useCallback(() => { setIds([]); write([]) }, [])
  return { ids, remember, clear }
}
