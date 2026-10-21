import { Suspense, lazy, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import dataset from './data/drugs.json'
import { createSearch } from './lib/search.js'
import { makeT } from './i18n/index.js'
import TopBar from './components/ui/TopBar.jsx'
import TabBar from './components/ui/TabBar.jsx'
import BottomSheet from './components/ui/BottomSheet.jsx'
import Toast from './components/ui/Toast.jsx'
import SearchBar from './components/SearchBar.jsx'
import SearchView from './components/SearchView.jsx'
import PrescriptionView, { ListSummaryBar } from './components/PrescriptionView.jsx'
import AboutView, { datasetFacts } from './components/AboutView.jsx'
import PrintSheet from './components/PrintSheet.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import { useInstallPrompt, useOffline, useOfflineReady } from './lib/pwa.js'
import { usePrescription } from './lib/usePrescription.js'
import { useRecents } from './lib/useRecents.js'
import { prescriptionTotals } from './lib/prescription.js'

// The scan screen (and the scan/upload code) loads only when someone opens it.
const ScanSheet = lazy(() => import('./components/ScanSheet.jsx'))

const search = createSearch(dataset.drugs)
const DRUGS_BY_ID = new Map(dataset.drugs.map((d) => [d.id, d]))
const EXAMPLES = dataset.drugs.slice(0, 3).map((d) => d.brandName)
const DATA_FACTS = datasetFacts(dataset)
const AUTO_PICK = 0.9 // show the card straight away only for a clear winner
const SCREENS = ['list', 'about'] // tabs on top of search, each a history entry
const screenFromHistory = (state) => (SCREENS.includes(state?.view) ? state.view : 'search')

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
  // 'search' | 'list' | 'about'. Read from history so a reload stays put and back still works.
  const [view, setView] = useState(() => screenFromHistory(history.state))
  const [scanOpen, setScanOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [toast, setToast] = useState(null)
  const scroller = useRef(null)
  const searchInput = useRef(null)
  const t = useMemo(() => makeT(lang), [lang])
  const list = usePrescription()
  const recents = useRecents()
  const totals = useMemo(() => prescriptionTotals(list.items, dataset.drugs), [list.items])

  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => search(deferredQuery), [deferredQuery])
  const typed = deferredQuery.trim()
  const selected = (picked?.query === deferredQuery && results.find((r) => r.drug.id === picked.id))
    || clearWinner(results)
  const others = results.filter((r) => r !== selected)
  const recentNames = recents.ids.map((id) => DRUGS_BY_ID.get(id)?.brandName).filter(Boolean)

  const showToast = (next) => setToast({ id: Date.now(), ...next })
  const hideToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    document.documentElement.lang = lang
    writePref('lang', lang)
  }, [lang])

  // "Ready to work offline" arrives once, as a toast.
  useEffect(() => {
    if (!offlineReady) return
    setToast({ id: Date.now(), message: t('offlineReady') })
    hideReady()
  }, [offlineReady, hideReady, t])

  // A shown result becomes a recent search (stored as a dataset id, not what was typed).
  const { remember } = recents
  useEffect(() => { if (selected) remember(selected.drug.id) }, [selected?.drug.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // New result or tab → start at the top.
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [selected?.drug.id, view])

  // Each tab other than Search is a history entry, so Android's back button returns to Search.
  useEffect(() => {
    const onPop = (e) => setView(screenFromHistory(e.state))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const openScreen = (name) => {
    if (view === name) return
    if (view === 'search') history.pushState({ view: name }, '')
    else history.replaceState({ view: name }, '') // one back press still reaches Search
    setView(name)
  }
  const backToSearch = () => (SCREENS.includes(history.state?.view) ? history.back() : setView('search'))
  const focusSearch = () => setTimeout(() => searchInput.current?.focus(), 0)

  const onTab = (id) => {
    if (id === 'scan') return setScanOpen(true)
    if (id === 'search') return view === 'search' ? focusSearch() : backToSearch()
    openScreen(id)
  }

  // Typing always means search.
  const onType = (value) => {
    setQuery(value)
    if (view !== 'search') backToSearch()
  }

  const removeWithUndo = (drugId) => {
    const index = list.items.findIndex((it) => it.drugId === drugId)
    const item = list.items[index]
    list.remove(drugId)
    const brand = DRUGS_BY_ID.get(drugId)?.brandName ?? ''
    showToast({ icon: 'trash', message: t('removedToast', { brand }), actionLabel: t('undo'), onAction: () => list.restore(item, index) })
  }

  const dismissInstall = () => { setInstallDismissed(true); writePref('installDismissed', '1') }
  const sheetOpen = scanOpen || confirmClear

  return (
    <>
      {/* Phone-width app on every screen size; the page around it is plain on tablets and desktops. */}
      <div inert={sheetOpen}
        className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-slate-50 text-ink shadow-2xl
          short:max-w-3xl print:hidden">
        <TopBar t={t} isSample={dataset.meta?.isSample} offline={offline} onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')} />

        <div className="relative flex min-h-0 flex-1 flex-col">
          {toast && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-20 px-4">
              <Toast key={toast.id} toast={toast} onDone={hideToast} />
            </div>
          )}

          <main ref={scroller} className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-2 pt-4">
            {/* On Search, content grows upward from the search box so what you tap is near the thumb. */}
            <div className={`flex w-full flex-col gap-4 ${view === 'search' ? 'mt-auto' : ''}`}>
              {view === 'about' ? (
                <AboutView t={t} facts={DATA_FACTS} />
              ) : view === 'list' ? (
                <PrescriptionView t={t} totals={totals} loaded={list.loaded} offline={offline}
                  onPacks={list.setPacks} onRemove={removeWithUndo} onAskClear={() => setConfirmClear(true)} />
              ) : (
                <SearchView t={t} typed={typed} results={results} selected={selected} others={others}
                  onPick={(id) => setPicked({ query: deferredQuery, id })}
                  examples={EXAMPLES} recents={recentNames} onExample={setQuery} onClearRecents={recents.clear}
                  install={{ show: canInstall && !installDismissed, onInstall: install, onDismiss: dismissInstall }}
                  list={list} onOpenList={() => openScreen('list')} onScan={() => setScanOpen(true)} />
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {view === 'search' && typed.length >= 3 && (results.length
                ? t(results.length === 1 ? 'resultsCountOne' : 'resultsCount', { count: results.length })
                : t('notFoundTitle'))}
            </p>
          </main>

          {view === 'search' && (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 short:gap-1 short:py-2">
              <SearchBar t={t} value={query} onChange={onType} inputRef={searchInput} />
              <Disclaimer t={t} />
            </div>
          )}
          {view === 'list' && totals.lines.length > 0 && <ListSummaryBar t={t} totals={totals} onPrint={() => window.print()} />}
        </div>

        <TabBar t={t} current={view} listCount={totals.lines.length} onSelect={onTab} />
      </div>

      <Suspense fallback={null}>
        {scanOpen && (
          <ScanSheet t={t} offline={offline} onClose={() => setScanOpen(false)}
            onSearch={(text) => { setScanOpen(false); setQuery(text); if (view !== 'search') backToSearch() }}
            onTypeInstead={() => { setScanOpen(false); if (view !== 'search') backToSearch(); focusSearch() }} />
        )}
      </Suspense>

      {confirmClear && (
        <BottomSheet t={t} title={t('clearAll')} onClose={() => setConfirmClear(false)}>
          <p className="text-lg text-ink">{t('clearConfirm')}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={() => { list.clear(); setConfirmClear(false) }}
              className="min-h-14 cursor-pointer rounded-full bg-warn-700 px-5 text-lg font-semibold text-white active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-warn-600/40">
              {t('clearAll')}
            </button>
            <button type="button" onClick={() => setConfirmClear(false)}
              className="min-h-12 cursor-pointer rounded-full border-2 border-slate-200 px-5 text-base font-semibold text-ink active:bg-slate-50
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
              {t('keep')}
            </button>
          </div>
        </BottomSheet>
      )}

      <PrintSheet totals={totals} isSample={dataset.meta?.isSample} />
    </>
  )
}
