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
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-1 text-base leading-relaxed text-slate-800">{children}</div>
    </section>
  )
}

export default function AboutView({ t, facts, onBack }) {
  const heading = useFocusOnMount()
  return (
    <section className="flex flex-col gap-4" aria-labelledby="about-title">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label={t('back')}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl border-2 border-slate-300 bg-white active:bg-slate-100
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
          <Icon name="arrowLeft" />
        </button>
        <h2 id="about-title" ref={heading} tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">{t('aboutTitle')}</h2>
      </div>

      {facts.isSample && (
        <p className="flex gap-2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-base font-semibold text-slate-900" role="note">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-amber-700" />{t('aboutSample')}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-3xl font-extrabold tabular-nums text-emerald-800">{facts.count}</div>
          <div className="text-sm text-slate-700">{t('aboutCount')}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-xl font-bold tabular-nums text-emerald-800">{facts.updated}</div>
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
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-emerald-800/30 px-4 font-semibold text-emerald-900
            active:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
          <Icon name="external" className="size-5" />{t('aboutReportLink')}
        </a>
      </Block>
    </section>
  )
}
