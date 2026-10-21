import Icon from '../Icon.jsx'

const TABS = [
  { id: 'search', icon: 'search', label: 'tabSearch' },
  { id: 'scan', icon: 'camera', label: 'scan' },
  { id: 'list', icon: 'clipboard', label: 'myList' },
  { id: 'about', icon: 'info', label: 'tabAbout' },
]

// Bottom tab bar: four 64px-tall targets, icon + label, active pill, safe-area padding.
// "Scan" opens a sheet over the current tab rather than switching pages.
export default function TabBar({ t, current, listCount, onSelect }) {
  return (
    <nav aria-label={t('tabsLabel')} className="border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {TABS.map(({ id, icon, label }) => {
          const active = id === current
          return (
            <li key={id}>
              <button type="button" onClick={() => onSelect(id)} aria-current={active ? 'page' : undefined}
                className="group flex h-16 w-full cursor-pointer flex-col items-center justify-center gap-1 short:h-14
                  focus-visible:outline-none">
                <span className={`relative grid h-8 w-14 place-items-center rounded-full transition duration-200
                  group-focus-visible:ring-4 group-focus-visible:ring-brand-600/40 group-active:scale-95
                  ${active ? 'bg-brand-100 text-brand-800' : 'text-slate-600'}`}>
                  <Icon name={icon} className="size-6" />
                  {id === 'list' && listCount > 0 && (
                    <span className="absolute -right-0.5 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-save-400 px-1
                      text-xs font-bold tabular-nums text-ink">
                      {listCount}
                    </span>
                  )}
                </span>
                <span className={`text-xs font-semibold ${active ? 'text-brand-800' : 'text-slate-600'}`}>
                  {t(label)}
                  {id === 'list' && listCount > 0 && <span className="sr-only"> ({listCount})</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
