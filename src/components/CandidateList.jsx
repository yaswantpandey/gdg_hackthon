import Icon from './Icon.jsx'

// Big, full-width rows; each one is a 64px+ tap target.
export default function CandidateList({ t, title, candidates, onPick }) {
  if (!candidates.length) return null
  return (
    <section aria-labelledby="candidates-title">
      <h2 id="candidates-title" className="mb-2 text-base font-semibold text-slate-800">{title}</h2>
      <ul className="flex flex-col gap-2">
        {candidates.map(({ drug, matchedOn }, i) => (
          <li key={drug.id} className="animate-rise" style={{ '--delay': `${i * 50}ms` }}>
            <button
              type="button"
              onClick={() => onPick(drug.id)}
              className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white
                px-4 py-3 text-left transition duration-150 active:scale-[0.98] active:bg-slate-100
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold text-slate-900">{drug.brandName}</span>
                <span className="block text-sm text-slate-700">
                  {drug.molecule} · {drug.strength}
                  {matchedOn === 'molecule' && <span className="ml-1 text-emerald-800">· {t('matchedOnMolecule')}</span>}
                </span>
              </span>
              <Icon name="chevronRight" className="size-6 shrink-0 text-slate-500" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
