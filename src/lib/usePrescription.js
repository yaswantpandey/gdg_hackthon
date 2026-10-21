import { useEffect, useState } from 'react'
import { loadValue, saveValue } from './store.js'
import { MAX_PACKS, cleanItems } from './prescription.js'

const KEY = 'prescription'

/** The saved list of {drugId, packs}, persisted to IndexedDB on every change. */
export function usePrescription() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadValue(KEY).then((value) => { setItems(cleanItems(value)); setLoaded(true) })
  }, [])

  useEffect(() => {
    if (loaded) saveValue(KEY, items) // don't overwrite storage with [] before the first load
  }, [items, loaded])

  const has = (drugId) => items.some((it) => it.drugId === drugId)
  const add = (drugId) => setItems((list) => (list.some((it) => it.drugId === drugId) ? list : [...list, { drugId, packs: 1 }]))
  const remove = (drugId) => setItems((list) => list.filter((it) => it.drugId !== drugId))
  const setPacks = (drugId, packs) => setItems((list) =>
    list.map((it) => (it.drugId === drugId ? { ...it, packs: Math.max(1, Math.min(MAX_PACKS, packs)) } : it)))
  const clear = () => setItems([])

  return { items, has, add, remove, setPacks, clear }
}
