import Icon from './Icon.jsx'

const chipClass = `min-h-12 cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-base font-semibold text-ink
  shadow-sm transition active:scale-95 active:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40`

// First screen: recent searches if there are any, otherwise examples from the dataset.
export default function EmptyState({ t, recents, examples, onPick, onClearRecents }) {
  return (
    <section className="animate-rise flex flex-col items-center px-2 text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-brand-100 text-brand-800" aria-hidden="true">
        <Icon name="pill" className="size-10" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink">{t('emptyTitle')}</h2>
      <p className="mt-1 text-base text-slate-700">{t('emptyHint')}</p>

      {recents.length > 0 ? (
        <>
          <div className="mt-6 flex w-full items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{t('recentTitle')}</p>
            <button type="button" onClick={onClearRecents}
              className="min-h-12 cursor-pointer rounded-full px-3 text-sm font-semibold text-brand-800 active:bg-brand-50
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
              {t('recentClear')}
            </button>
          </div>
          <div className="mt-1 flex w-full flex-wrap gap-2">
            {recents.map((name) => (
              <button key={name} type="button" onClick={() => onPick(name)} className={`${chipClass} inline-flex items-center gap-2`}>
                <Icon name="history" className="size-4 text-slate-500" />{name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-6 text-sm font-semibold text-slate-700">{t('tryThese')}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {examples.map((name) => (
              <button key={name} type="button" onClick={() => onPick(name)} className={chipClass}>{name}</button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
