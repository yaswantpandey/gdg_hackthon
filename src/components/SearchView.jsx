import CandidateList from './CandidateList.jsx'
import ResultCard from './ResultCard.jsx'
import AddToListBar from './AddToListBar.jsx'
import EmptyState from './EmptyState.jsx'
import NotFound from './NotFound.jsx'
import InstallCard from './InstallCard.jsx'

// The search tab: empty (recents / examples) → not found → result + other matches.
// Search runs synchronously over the bundled data, so there is no loading state here.
export default function SearchView({
  t, typed, results, selected, others, onPick, examples, recents, onExample, onClearRecents,
  install, list, onOpenList, onScan,
}) {
  if (typed.length < 3) {
    return (
      <>
        <EmptyState t={t} recents={recents} examples={examples} onPick={onExample} onClearRecents={onClearRecents} />
        {install.show && <InstallCard t={t} onInstall={install.onInstall} onDismiss={install.onDismiss} />}
      </>
    )
  }
  if (results.length === 0) return <NotFound t={t} query={typed} onScan={onScan} />

  return (
    <>
      {selected && (
        <>
          <ResultCard key={selected.drug.id} t={t} match={selected} />
          <AddToListBar t={t} inList={list.has(selected.drug.id)} onAdd={() => list.add(selected.drug.id)} onOpenList={onOpenList} />
        </>
      )}
      <CandidateList key={typed} t={t} title={selected ? t('otherMatches') : t('didYouMean')} candidates={others} onPick={onPick} />
    </>
  )
}
