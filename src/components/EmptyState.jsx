import Icon from './Icon.jsx'

// First screen. Example chips come from the dataset, so they always work.
export default function EmptyState({ t, examples, onPick }) {
  return (
    <section className="animate-rise flex flex-col items-center px-2 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-800">
        <Icon name="pill" className="size-10" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">{t('emptyTitle')}</h2>
      <p className="mt-1 text-base text-slate-700">{t('emptyHint')}</p>

      <p className="mt-6 text-sm font-semibold text-slate-800">{t('tryThese')}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {examples.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onPick(name)}
            className="min-h-12 cursor-pointer rounded-full border-2 border-emerald-800/30 bg-white px-5 text-base font-semibold
              text-emerald-900 transition active:scale-95 active:bg-emerald-50
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40"
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}
