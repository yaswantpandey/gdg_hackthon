import Icon from './Icon.jsx'

// Only on the start screen, so it never competes with a result.
export default function InstallCard({ t, onInstall, onDismiss }) {
  return (
    <section className="animate-rise flex items-center gap-3 rounded-2xl border-2 border-brand-800/20 bg-white p-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-800">
        <Icon name="download" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">{t('installTitle')}</p>
        <p className="text-sm text-slate-700">{t('installHint')}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button type="button" onClick={onInstall}
          className="min-h-12 cursor-pointer rounded-xl bg-brand-800 px-4 text-base font-semibold text-white transition
            active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-700/40">
          {t('install')}
        </button>
        <button type="button" onClick={onDismiss}
          className="min-h-10 cursor-pointer rounded-xl px-2 text-sm font-medium text-slate-700 active:bg-slate-100
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-700/40">
          {t('notNow')}
        </button>
      </div>
    </section>
  )
}
