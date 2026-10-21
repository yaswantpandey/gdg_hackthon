import Icon from './Icon.jsx'
import SearchBar from './SearchBar.jsx'
import Disclaimer from './Disclaimer.jsx'
import CandidateList from './CandidateList.jsx'
import ResultCard from './ResultCard.jsx'
import AddToListBar from './AddToListBar.jsx'
import EmptyState from './EmptyState.jsx'
import NotFound from './NotFound.jsx'
import InstallCard from './InstallCard.jsx'

// Laptop layout of the Search tab: search + matches on the left, the result on the right.
// Same pieces as the phone layout (SearchView), arranged in two columns.
export default function DesktopSearch({
  t, query, onType, inputRef, typed, results, selected, others, onPick, examples, recents, onExample,
  onClearRecents, install, list, onOpenList, onScan,
}) {
  const empty = typed.length < 3
  const notFound = !empty && results.length === 0

  return (
    <div className="grid grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start gap-8">
      <aside className="sticky top-0 flex flex-col gap-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <SearchBar t={t} value={query} onChange={onType} inputRef={inputRef} />
          <div className="mt-3"><Disclaimer t={t} /></div>
        </div>
        {!empty && !notFound && (
          <CandidateList key={typed} t={t} title={selected ? t('otherMatches') : t('didYouMean')} candidates={others} onPick={onPick} />
        )}
        {empty && install.show && <InstallCard t={t} onInstall={install.onInstall} onDismiss={install.onDismiss} />}
      </aside>

      <section className="min-w-0">
        {empty ? (
          <div className="rounded-3xl bg-white px-8 py-12 shadow-sm ring-1 ring-slate-200">
            <EmptyState t={t} recents={recents} examples={examples} onPick={onExample} onClearRecents={onClearRecents} />
          </div>
        ) : notFound ? (
          <div className="rounded-3xl bg-white px-8 py-12 shadow-sm ring-1 ring-slate-200">
            <NotFound t={t} query={typed} onScan={onScan} />
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4">
            <ResultCard key={selected.drug.id} t={t} match={selected} />
            <AddToListBar t={t} inList={list.has(selected.drug.id)} onAdd={() => list.add(selected.drug.id)} onOpenList={onOpenList} />
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-300 px-8 py-16 text-center">
            <Icon name="arrowLeft" className="size-10 text-brand-700" />
            <p className="mt-3 text-lg font-semibold text-ink">{t('pickOne')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
