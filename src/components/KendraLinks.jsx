import Icon from './Icon.jsx'
import { KENDRA_MAP_URL, KENDRA_OFFICIAL_URL } from '../lib/links.js'

const linkClass = `flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3
  text-base font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4`

// Where to buy the generic. Both links need internet; we say so when offline.
export default function KendraLinks({ t, offline }) {
  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
        <Icon name="mapPin" className="size-5 text-brand-800" />
        {t('kendraTitle')}
      </h3>
      {offline && <p className="mt-1 text-sm text-slate-700">{t('needsInternet')}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={KENDRA_MAP_URL} target="_blank" rel="noopener noreferrer"
          className={`${linkClass} border-brand-800 bg-brand-800 text-white focus-visible:ring-brand-700/40`}>
          <Icon name="mapPin" className="size-5" />{t('kendraMap')}
        </a>
        <a href={KENDRA_OFFICIAL_URL} target="_blank" rel="noopener noreferrer"
          className={`${linkClass} border-brand-800/30 text-brand-900 focus-visible:ring-brand-700/40`}>
          <Icon name="external" className="size-5" />{t('kendraOfficial')}
        </a>
      </div>
    </section>
  )
}
