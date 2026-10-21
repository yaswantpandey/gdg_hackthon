import CandidateList from './CandidateList.jsx'
import ResultCard from './ResultCard.jsx'
import EmptyState from './EmptyState.jsx'
import NotFound from './NotFound.jsx'
import InstallCard from './InstallCard.jsx'
import { ScanFailed, ScanRead, ScanReading } from './ScanPanel.jsx'

// The search screen: scan status, then empty / not found / result + other matches.
export default function SearchView({
  t, query, typed, results, selected, others, onPick, examples, onExample,
  scan, onCancelScan, onFocusSearch, install, list, onOpenList,
}) {
  const showScanRead = scan.status === 'read' && scan.text === query
  const scanBusy = scan.status === 'reading' || scan.status === 'failed'

  return (
    <>
      {scan.status === 'reading' && <ScanReading t={t} previewUrl={scan.previewUrl} onCancel={onCancelScan} />}
      {scan.status === 'failed' && <ScanFailed t={t} reason={scan.reason} onType={() => onFocusSearch(false)} />}
      {showScanRead && <ScanRead t={t} text={scan.text} onEdit={() => onFocusSearch(true)} />}

      {scanBusy ? null : typed.length < 3 ? (
        <>
          <EmptyState t={t} examples={examples} onPick={onExample} />
          {install.show && <InstallCard t={t} onInstall={install.onInstall} onDismiss={install.onDismiss} />}
        </>
      ) : results.length === 0 ? (
        <NotFound t={t} query={typed} />
      ) : (
        <>
          {selected && (
            <ResultCard key={selected.drug.id} t={t} match={selected}
              inList={list.has(selected.drug.id)} onAdd={() => list.add(selected.drug.id)} onOpenList={onOpenList} />
          )}
          <CandidateList key={typed} t={t} title={selected ? t('otherMatches') : t('didYouMean')} candidates={others} onPick={onPick} />
        </>
      )}
    </>
  )
}
