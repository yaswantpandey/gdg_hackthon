export default function Header({ t, isSample, onToggleLang }) {
  return (
    <header className="flex items-center gap-3 bg-emerald-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white
      short:pb-1.5 short:pt-[max(0.375rem,env(safe-area-inset-top))]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold leading-tight">{t('appName')}</h1>
          {isSample && (
            <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-slate-900">{t('sampleBadge')}</span>
          )}
        </div>
        <p className="text-sm leading-snug text-emerald-50 short:hidden">{t('tagline')}</p>
      </div>
      <button
        type="button"
        onClick={onToggleLang}
        className="min-h-12 shrink-0 cursor-pointer rounded-xl border-2 border-white/60 px-3 text-base font-semibold transition
          active:scale-95 active:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
      >
        {t('otherLanguage')}
      </button>
    </header>
  )
}
