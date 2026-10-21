import Icon from '../Icon.jsx'

// Native-style top app bar: app name, status badges, language toggle.
export default function TopBar({ t, isSample, offline, onToggleLang }) {
  return (
    <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white" aria-hidden="true">
        <Icon name="pill" className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <h1 className="text-lg font-bold leading-tight text-ink">{t('appName')}</h1>
          {isSample && (
            <span className="rounded-full bg-warn-50 px-2 py-0.5 text-xs font-semibold text-warn-800">{t('sampleBadge')}</span>
          )}
        </div>
        <p className="truncate text-sm text-slate-600 short:hidden">{t('tagline')}</p>
      </div>
      {offline && (
        <span role="status" aria-label={t('offlineBadge')}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">
          <Icon name="wifiOff" className="size-3.5" />{t('offlineShort')}
        </span>
      )}
      <button type="button" onClick={onToggleLang}
        className="min-h-12 shrink-0 cursor-pointer rounded-full border-2 border-slate-200 px-3.5 text-base font-semibold text-ink
          transition active:scale-95 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
        {t('otherLanguage')}
      </button>
    </header>
  )
}
