// Tiny IndexedDB key-value store (no library). Works offline and survives restarts.
// Falls back to memory when IndexedDB is unavailable (some private modes).

const DB_NAME = 'sasti-dawa'
const STORE = 'kv'
const memory = new Map()
let dbPromise

function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function run(mode, action) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = action(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function loadValue(key) {
  try { return await run('readonly', (s) => s.get(key)) } catch { return memory.get(key) }
}

export async function saveValue(key, value) {
  memory.set(key, value)
  try { await run('readwrite', (s) => s.put(value, key)) } catch { /* memory copy is enough for this session */ }
}
