import Icon from './Icon.jsx'

// Honest dead end: we say we don't know rather than guess, and offer the next step.
export default function NotFound({ t, query, onScan }) {
  return (
    <section className="animate-rise flex flex-col items-center px-2 text-center" role="status">
      <div className="grid size-20 place-items-center rounded-3xl bg-slate-200 text-slate-700" aria-hidden="true">
        <Icon name="searchX" className="size-10" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink">{t('notFoundTitle')}</h2>
      <p className="mt-2 break-words text-lg text-ink">{t('notFoundQuery', { query })}</p>
      <p className="mt-1 text-base text-slate-700">{t('notFoundBody')}</p>
      <button type="button" onClick={onScan}
        className="mt-5 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-brand-700/30 px-5
          text-base font-semibold text-brand-800 active:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
        <Icon name="camera" className="size-5" />{t('scanInstead')}
      </button>
    </section>
  )
}
