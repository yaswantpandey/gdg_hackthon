import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import dataset from './data/drugs.json'
import { createSearch } from './lib/search.js'
import { makeT } from './i18n/index.js'
import Header from './components/Header.jsx'
import SearchBar from './components/SearchBar.jsx'
import CandidateList from './components/CandidateList.jsx'
import ResultCard from './components/ResultCard.jsx'
import EmptyState from './components/EmptyState.jsx'
import NotFound from './components/NotFound.jsx'
import Disclaimer from './components/Disclaimer.jsx'

const search = createSearch(dataset.drugs)
const EXAMPLES = dataset.drugs.slice(0, 3).map((d) => d.brandName)
const AUTO_PICK = 0.9 // show the card straight away only for a clear winner

function loadLang() {
  try { return localStorage.getItem('lang') ?? 'hi' } catch { return 'hi' }
}

/** Top result wins outright if it is confident and clearly ahead of the next one. */
function clearWinner(results) {
  const [first, second] = results
  if (!first || first.confidence < AUTO_PICK) return null
  return !second || first.confidence - second.confidence >= 0.1 ? first : null
}

export default function App() {
  const [lang, setLang] = useState(loadLang)
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '') // ?q= deep link
  const [picked, setPicked] = useState(null) // { query, id }: only valid for the query it was made on
  const scroller = useRef(null)
  const t = useMemo(() => makeT(lang), [lang])

  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => search(deferredQuery), [deferredQuery])
  const typed = deferredQuery.trim()

  const selected = (picked?.query === deferredQuery && results.find((r) => r.drug.id === picked.id))
    || clearWinner(results)
  const others = results.filter((r) => r !== selected)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch { /* private mode: fine */ }
  }, [lang])

  // New result → bring the hero into view.
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [selected?.drug.id])

  const pick = (id) => setPicked({ query: deferredQuery, id })

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <Header t={t} isSample={dataset.meta?.isSample} onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')} />

      {/* Content grows upward from the search bar, so the thing to tap is near the thumb. */}
      <main ref={scroller} className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
        <div className="mx-auto mt-auto flex w-full max-w-md flex-col gap-4">
          {typed.length < 3 ? (
            <EmptyState t={t} examples={EXAMPLES} onPick={setQuery} />
          ) : results.length === 0 ? (
            <NotFound t={t} query={typed} />
          ) : (
            <>
              {selected && <ResultCard key={selected.drug.id} t={t} match={selected} />}
              <CandidateList
                key={deferredQuery}
                t={t}
                title={selected ? t('otherMatches') : t('didYouMean')}
                candidates={others}
                onPick={pick}
              />
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {typed.length >= 3 && (results.length ? t('resultsCount', { count: results.length }) : t('notFoundTitle'))}
        </p>
      </main>

      <footer className="border-t-2 border-slate-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <SearchBar t={t} value={query} onChange={setQuery} />
          <Disclaimer t={t} />
        </div>
      </footer>
    </div>
  )
}
