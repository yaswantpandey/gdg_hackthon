import Icon from './Icon.jsx'
import SavingHero from './SavingHero.jsx'
import { formatInr } from '../lib/price.js'

const SURE_MATCH = 0.9

function Fact({ label, children, wide }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-lg font-semibold text-ink">{children}</dd>
    </div>
  )
}

export default function ResultCard({ t, match }) {
  const { drug, confidence } = match
  return (
    <article className="animate-rise overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <SavingHero t={t} drug={drug} />

      {confidence < SURE_MATCH && (
        <p className="flex gap-2 border-y border-warn-200 bg-warn-50 px-5 py-3 text-base text-ink" role="note">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-warn-700" />
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

      <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
        {t('source')}: {drug.source} · {t('updated')}: {drug.lastUpdated}
      </p>
    </article>
  )
}
