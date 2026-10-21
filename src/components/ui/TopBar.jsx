import Icon from '../Icon.jsx'

const NAV = [
  { id: 'search', icon: 'search', label: 'tabSearch' },
  { id: 'scan', icon: 'camera', label: 'scan' },
  { id: 'list', icon: 'clipboard', label: 'myList' },
  { id: 'about', icon: 'info', label: 'tabAbout' },
]

// Native-style top app bar. On laptops it also carries the navigation (no bottom tab bar there).
export default function TopBar({ t, isSample, offline, onToggleLang, desktopNav }) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:px-8 lg:py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-2 lg:gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white" aria-hidden="true">
          <Icon name="pill" className="size-5" />
        </div>
        <div className="min-w-0 flex-1 lg:flex-none">
          <div className="flex flex-wrap items-center gap-x-2">
            <h1 className="text-lg font-bold leading-tight text-ink lg:text-xl">{t('appName')}</h1>
            {isSample && (
              <span className="rounded-full bg-warn-50 px-2 py-0.5 text-xs font-semibold text-warn-800">{t('sampleBadge')}</span>
            )}
          </div>
          <p className="truncate text-sm text-slate-600 short:hidden">{t('tagline')}</p>
        </div>

        {desktopNav && (
          <nav aria-label={t('tabsLabel')} className="mx-auto">
            <ul className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {NAV.map(({ id, icon, label }) => {
                const active = id === desktopNav.current
                return (
                  <li key={id}>
                    <button type="button" onClick={() => desktopNav.onSelect(id)} aria-current={active ? 'page' : undefined}
                      className={`relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-base font-semibold transition
                        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40
                        ${active ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-600 hover:text-ink'}`}>
                      <Icon name={icon} className="size-5" />
                      {t(label)}
                      {id === 'list' && desktopNav.listCount > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-save-400 px-1 text-xs font-bold tabular-nums text-ink">
                          {desktopNav.listCount}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        {offline && (
          <span role="status" aria-label={t('offlineBadge')}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">
            <Icon name="wifiOff" className="size-3.5" />{t('offlineShort')}
          </span>
        )}
        <button type="button" onClick={onToggleLang}
          className="min-h-12 shrink-0 cursor-pointer rounded-full border-2 border-slate-200 px-3.5 text-base font-semibold text-ink
            transition hover:bg-slate-50 active:scale-95 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
          {t('otherLanguage')}
        </button>
      </div>
    </header>
  )
}
