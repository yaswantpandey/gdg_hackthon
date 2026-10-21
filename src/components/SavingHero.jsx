import Icon from './Icon.jsx'
import { formatInr, savingFor } from '../lib/price.js'
import { useCountUp } from '../lib/useCountUp.js'

// The headline: "₹240 → ₹28", then the saving. Motion tells the story:
// the brand price gets struck out, the generic price lands, the saving counts up.
export default function SavingHero({ t, drug }) {
  const { brand, generic, saved, percent } = savingFor(drug)
  const counted = useCountUp(saved)
  const shownSaving = counted >= saved ? saved : Math.round(counted)

  return (
    <div className="bg-emerald-50 px-5 pb-6 pt-5">
      <h2 className="text-base font-semibold text-slate-800">{t('genericFor', { brand: drug.brandName })}</h2>

      <p className="sr-only">
        {t('heroA11y', { brand: formatInr(brand), generic: formatInr(generic), saved: formatInr(saved), percent })}
      </p>

      <div className="mt-3 flex items-end gap-3" aria-hidden="true">
        <div>
          <div className="text-sm font-medium text-slate-700">{t('brandLabel')}</div>
          <div className="relative text-3xl font-semibold tabular-nums text-slate-600">
            {formatInr(brand)}
            <span className="animate-strike absolute inset-x-[-4px] top-1/2 h-[3px] origin-left rounded bg-red-700" />
          </div>
        </div>
        <Icon name="arrowRight" className="mb-2 size-7 shrink-0 text-slate-500" />
        <div>
          <div className="text-sm font-medium text-emerald-900">{t('genericLabel')}</div>
          <div className="animate-pop text-6xl font-extrabold leading-none tabular-nums text-emerald-800">
            {formatInr(generic)}
          </div>
        </div>
      </div>

      <p className="animate-rise mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-full bg-amber-300 px-4 py-2
        text-lg font-bold text-slate-900" style={{ '--delay': '350ms' }} aria-hidden="true">
        <span className="tabular-nums">{t('youSave', { amount: formatInr(shownSaving) })}</span>
        <span>·</span>
        <span>{t('percentCheaper', { percent })}</span>
      </p>

      <p className="mt-2 text-sm text-slate-700">{t('pack', { count: drug.packSize, form: t.form(drug.form) })}</p>
    </div>
  )
}
