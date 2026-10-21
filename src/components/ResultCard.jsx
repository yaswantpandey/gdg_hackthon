import Icon from './Icon.jsx'
import SavingHero from './SavingHero.jsx'
import { formatInr } from '../lib/price.js'

const SURE_MATCH = 0.9

function Fact({ label, children, wide }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-lg font-semibold text-slate-900">{children}</dd>
    </div>
  )
}

export default function ResultCard({ t, match }) {
  const { drug, confidence } = match
  return (
    <article className="animate-rise overflow-hidden rounded-3xl border-2 border-emerald-800/15 bg-white shadow-sm">
      <SavingHero t={t} drug={drug} />

      {confidence < SURE_MATCH && (
        <p className="flex gap-2 border-y-2 border-amber-300 bg-amber-50 px-5 py-3 text-base text-slate-900" role="note">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-amber-700" />
          {t('checkMatch')}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4">
        <Fact label={t('genericName')} wide>{drug.genericName}</Fact>
        <Fact label={t('strength')}>{drug.strength}</Fact>
        <Fact label={t('form')}>{t.formName(drug.form)}</Fact>
        <Fact label={t('molecule')} wide>{drug.molecule}</Fact>
        {drug.nppaCeilingPriceInr != null && (
          <Fact label={t('nppa')} wide>{formatInr(drug.nppaCeilingPriceInr)}</Fact>
        )}
      </dl>

      <p className="border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
        {t('source')}: {drug.source} · {t('updated')}: {drug.lastUpdated}
      </p>
    </article>
  )
}
