import Icon from './Icon.jsx'

// Honest dead end: we say we don't know rather than guess.
export default function NotFound({ t, query }) {
  return (
    <section className="animate-rise rounded-3xl border-2 border-slate-300 bg-slate-50 p-5" role="status">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-800">
          <Icon name="searchX" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t('notFoundTitle')}</h2>
      </div>
      <p className="mt-3 break-words text-lg text-slate-900">{t('notFoundQuery', { query })}</p>
      <p className="mt-1 text-base text-slate-700">{t('notFoundBody')}</p>
    </section>
  )
}
