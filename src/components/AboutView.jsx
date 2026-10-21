import Icon from './Icon.jsx'
import { useFocusOnMount } from '../lib/useFocusOnMount.js'

const REPORT_URL = 'https://github.com/yaswantpandey/gdg_hackthon/issues'

/** Facts about the bundled dataset, worked out from the data itself so they can't drift. */
export function datasetFacts(dataset) {
  const counts = new Map()
  for (const d of dataset.drugs) counts.set(d.source, (counts.get(d.source) ?? 0) + 1)
  return {
    count: dataset.drugs.length,
    isSample: Boolean(dataset.meta?.isSample),
    updated: dataset.drugs.map((d) => d.lastUpdated).concat(dataset.meta?.lastUpdated ?? []).sort().at(-1),
    sources: [...counts].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n),
  }
}

function Block({ title, children }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-1 text-base leading-relaxed text-slate-800">{children}</div>
    </section>
  )
}

export default function AboutView({ t, facts }) {
  const heading = useFocusOnMount()
  return (
    <section className="flex flex-col gap-4" aria-labelledby="about-title">
      <h2 id="about-title" ref={heading} tabIndex={-1} className="px-1 text-2xl font-bold text-ink outline-none">{t('aboutTitle')}</h2>

      {facts.isSample && (
        <p className="flex gap-2 rounded-2xl border-2 border-warn-300 bg-warn-50 p-4 text-base font-semibold text-ink" role="note">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-warn-700" />{t('aboutSample')}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-brand-50 p-4">
          <div className="text-3xl font-extrabold tabular-nums text-brand-800">{facts.count}</div>
          <div className="text-sm text-slate-700">{t('aboutCount')}</div>
        </div>
        <div className="rounded-3xl bg-brand-50 p-4">
          <div className="text-xl font-bold tabular-nums text-brand-800">{facts.updated}</div>
          <div className="text-sm text-slate-700">{t('aboutUpdated')}</div>
        </div>
      </div>

      <Block title={t('aboutSources')}>
        <ul className="list-disc pl-5">
          {facts.sources.map((s) => <li key={s.name} className="break-words">{s.name} <span className="text-slate-600">({s.n})</span></li>)}
        </ul>
      </Block>
      <Block title={t('aboutPricesTitle')}>{t('aboutPrices')}</Block>
      <Block title={t('aboutAiTitle')}>{t('aboutAi')}</Block>
      <Block title={t('aboutPrivacyTitle')}>{t('aboutPrivacy')}</Block>
      <Block title={t('aboutReportTitle')}>
        <p>{t('aboutReport')}</p>
        <a href={REPORT_URL} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-brand-800/30 px-4 font-semibold text-brand-900
            active:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-700/40">
          <Icon name="external" className="size-5" />{t('aboutReportLink')}
        </a>
      </Block>
    </section>
  )
}
