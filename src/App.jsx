import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import dataset from './data/drugs.json'
import { createSearch } from './lib/search.js'
import { makeT } from './i18n/index.js'
import Header from './components/Header.jsx'
import SearchBar from './components/SearchBar.jsx'
import SearchView from './components/SearchView.jsx'
import PrescriptionView from './components/PrescriptionView.jsx'
import PrintSheet from './components/PrintSheet.jsx'
import ListChip from './components/ListChip.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import OfflineBar from './components/OfflineBar.jsx'
import ReadyToast from './components/ReadyToast.jsx'
import { useInstallPrompt, useOffline, useOfflineReady } from './lib/pwa.js'
import { useScan } from './lib/useScan.js'
import { usePrescription } from './lib/usePrescription.js'
import { prescriptionTotals } from './lib/prescription.js'

const search = createSearch(dataset.drugs)
const EXAMPLES = dataset.drugs.slice(0, 3).map((d) => d.brandName)
const AUTO_PICK = 0.9 // show the card straight away only for a clear winner

// localStorage can throw in private mode; preferences are a nice-to-have.
function readPref(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function writePref(key, value) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

/** Top result wins outright if it is confident and clearly ahead of the next one. */
function clearWinner(results) {
  const [first, second] = results
  if (!first || first.confidence < AUTO_PICK) return null
  return !second || first.confidence - second.confidence >= 0.1 ? first : null
}

export default function App() {
  const [lang, setLang] = useState(() => readPref('lang', 'hi'))
  const [installDismissed, setInstallDismissed] = useState(() => readPref('installDismissed', '') === '1')
  const offline = useOffline()
  const [offlineReady, hideReady] = useOfflineReady()
  const { canInstall, install } = useInstallPrompt()
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '') // ?q= deep link
  const [picked, setPicked] = useState(null) // { query, id }: only valid for the query it was made on
  // 'search' | 'list'. Read from history so a reload on the list stays on the list and back still works.
  const [view, setView] = useState(() => (history.state?.view === 'list' ? 'list' : 'search'))
  const scroller = useRef(null)
  const searchInput = useRef(null)
  const t = useMemo(() => makeT(lang), [lang])
  const { scan, start: startScan, cancel: cancelScan, clear: clearScan } = useScan(setQuery)
  const list = usePrescription()
  const totals = useMemo(() => prescriptionTotals(list.items, dataset.drugs), [list.items])

  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => search(deferredQuery), [deferredQuery])
  const typed = deferredQuery.trim()
  const selected = (picked?.query === deferredQuery && results.find((r) => r.drug.id === picked.id))
    || clearWinner(results)
  const others = results.filter((r) => r !== selected)

  useEffect(() => {
    document.documentElement.lang = lang
    writePref('lang', lang)
  }, [lang])

  // New result or screen → start at the top.
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [selected?.drug.id, view])

  // The list is a history entry, so Android's back button returns to search.
  useEffect(() => {
    const onPop = (e) => setView(e.state?.view === 'list' ? 'list' : 'search')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const openList = () => { history.pushState({ view: 'list' }, ''); setView('list') }
  const backToSearch = () => (history.state?.view === 'list' ? history.back() : setView('search'))

  // Typing always means search: it takes over from a scan and from the list screen.
  const onType = (value) => {
    setQuery(value)
    if (scan.status === 'failed') clearScan()
    if (view === 'list') backToSearch()
  }
  const focusSearch = (selectAll) => {
    clearScan()
    searchInput.current?.focus()
    if (selectAll) searchInput.current?.select()
  }
  const dismissInstall = () => { setInstallDismissed(true); writePref('installDismissed', '1') }

  return (
    <>
      <div className="flex h-dvh flex-col bg-slate-50 text-slate-900 print:hidden">
        <Header t={t} isSample={dataset.meta?.isSample} onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')} />
        {offline && <OfflineBar t={t} />}

        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* One-time toast sits at the top, away from the controls near the thumb. */}
          {offlineReady && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 px-4">
              <ReadyToast t={t} onDone={hideReady} />
            </div>
          )}
          {/* Content grows upward from the search bar, so the thing to tap is near the thumb. */}
          <main ref={scroller} className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
            <div className="mx-auto mt-auto flex w-full max-w-md flex-col gap-4">
              {view === 'list' ? (
                <PrescriptionView t={t} totals={totals} offline={offline} onBack={backToSearch}
                  onPacks={list.setPacks} onRemove={list.remove} onClear={list.clear} onPrint={() => window.print()} />
              ) : (
                <SearchView t={t} query={query} typed={typed} results={results} selected={selected} others={others}
                  onPick={(id) => setPicked({ query: deferredQuery, id })} examples={EXAMPLES} onExample={setQuery}
                  scan={scan} onCancelScan={cancelScan} onFocusSearch={focusSearch}
                  install={{ show: canInstall && !installDismissed, onInstall: install, onDismiss: dismissInstall }}
                  list={list} onOpenList={openList} />
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {view === 'search' && typed.length >= 3 && (results.length
                ? t(results.length === 1 ? 'resultsCountOne' : 'resultsCount', { count: results.length })
                : t('notFoundTitle'))}
            </p>
          </main>
        </div>

        <footer className="border-t-2 border-slate-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto flex max-w-md flex-col gap-3">
            {view === 'search' && totals.lines.length > 0 && (
              <ListChip t={t} count={totals.lines.length} saved={totals.saved} onOpen={openList} />
            )}
            <SearchBar t={t} value={query} onChange={onType} inputRef={searchInput}
              onPhoto={startScan} scanning={scan.status === 'reading'} />
            <Disclaimer t={t} />
          </div>
        </footer>
      </div>

      <PrintSheet totals={totals} isSample={dataset.meta?.isSample} />
    </>
  )
}
