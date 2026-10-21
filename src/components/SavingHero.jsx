import Icon from './Icon.jsx'
import AnimatedNumber from './ui/AnimatedNumber.jsx'
import { formatInr, savingFor } from '../lib/price.js'
import { tNode } from '../i18n/index.js'

// The headline: "₹240 → ₹28", then the saving. Motion tells the story in under 300 ms:
// the brand price is struck out, the generic price lands, the saving counts up.
export default function SavingHero({ t, drug }) {
  const { brand, generic, saved, percent } = savingFor(drug)

  return (
    <div className="bg-gradient-to-br from-brand-50 to-white px-5 pb-5 pt-5 short:pb-3 short:pt-3">
      <h2 className="text-base font-semibold text-slate-700">{t('genericFor', { brand: drug.brandName })}</h2>

      <p className="sr-only">
        {t('heroA11y', { brand: formatInr(brand), generic: formatInr(generic), saved: formatInr(saved), percent })}
      </p>

      {/* Wraps instead of overflowing when the phone's text size is turned up. */}
      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1 short:mt-1" aria-hidden="true">
        <div>
          <div className="text-sm font-medium text-slate-600">{t('brandLabel')}</div>
          <div className="relative text-3xl font-semibold tabular-nums text-slate-500">
            {formatInr(brand)}
            <span className="animate-strike absolute inset-x-[-4px] top-1/2 h-[3px] origin-left rounded bg-ink/70" />
          </div>
        </div>
        <Icon name="arrowRight" className="mb-2 size-7 shrink-0 text-slate-400" />
        <div>
          <div className="text-sm font-medium text-brand-800">{t('genericLabel')}</div>
          <div className="animate-pop text-6xl font-extrabold leading-none tracking-tight tabular-nums text-brand-800 short:text-5xl">
            {formatInr(generic)}
          </div>
        </div>
      </div>

      <p className="animate-rise mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-full bg-save-300 px-4 py-2 text-lg font-bold
        text-ink short:mt-2" style={{ '--delay': '160ms' }} aria-hidden="true">
        <span>{tNode(t, 'youSave', 'amount', <AnimatedNumber key="n" value={saved} format={formatInr} />)}</span>
        <span>·</span>
        <span>{tNode(t, 'percentCheaper', 'percent', <AnimatedNumber key="n" value={percent} />)}</span>
      </p>

      <p className="mt-2 text-sm text-slate-600">{t('pack', { count: drug.packSize, form: t.form(drug.form) })}</p>
    </div>
  )
}
