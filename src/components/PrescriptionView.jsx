import Icon from './Icon.jsx'
import KendraLinks from './KendraLinks.jsx'
import Disclaimer from './Disclaimer.jsx'
import AnimatedNumber from './ui/AnimatedNumber.jsx'
import { SkeletonCard } from './ui/Skeleton.jsx'
import { formatInr } from '../lib/price.js'
import { MAX_PACKS } from '../lib/prescription.js'
import { useFocusOnMount } from '../lib/useFocusOnMount.js'
import { tNode } from '../i18n/index.js'

const stepClass = `grid size-12 cursor-pointer place-items-center rounded-full border-2 border-slate-200 text-ink
  transition active:scale-95 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40
  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40`

function Line({ t, line, onPacks, onRemove }) {
  const { drug, packs } = line
  return (
    <li className="animate-rise rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-ink">{drug.brandName}</p>
          <p className="text-base text-slate-700">{drug.genericName}</p>
          <p className="text-sm text-slate-600">{drug.strength} · {t('pack', { count: drug.packSize, form: t.form(drug.form) })}</p>
        </div>
        <button type="button" onClick={onRemove} aria-label={t('removeA11y', { brand: drug.brandName })}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 active:bg-warn-50 active:text-warn-700
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-warn-600/40">
          <Icon name="trash" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2" role="group" aria-label={t('packs')}>
          <button type="button" className={stepClass} onClick={() => onPacks(packs - 1)} disabled={packs <= 1} aria-label={t('fewer')}>
            <Icon name="minus" />
          </button>
          <span className="w-8 text-center text-xl font-bold tabular-nums" aria-live="polite">{packs}</span>
          <button type="button" className={stepClass} onClick={() => onPacks(packs + 1)} disabled={packs >= MAX_PACKS} aria-label={t('more')}>
            <Icon name="plus" />
          </button>
        </div>
        <p className="ml-auto text-right tabular-nums">
          <span className="block text-sm text-slate-500 line-through">{formatInr(line.brand)}</span>
          <span className="block text-xl font-bold text-brand-800">{formatInr(line.generic)}</span>
        </p>
      </div>
    </li>
  )
}

/** Scrolling part of the My List tab. */
export default function PrescriptionView({ t, totals, loaded, offline, onPacks, onRemove, onAskClear }) {
  const empty = totals.lines.length === 0 && totals.missing.length === 0
  const heading = useFocusOnMount()
  return (
    <section className="flex flex-col gap-4" aria-labelledby="list-title">
      <h2 id="list-title" ref={heading} tabIndex={-1} className="px-1 text-2xl font-bold text-ink outline-none">{t('myList')}</h2>

      {!loaded ? (
        <><SkeletonCard /><SkeletonCard /></>
      ) : empty ? (
        <div className="animate-rise flex flex-col items-center rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
          <div className="grid size-16 place-items-center rounded-3xl bg-brand-100 text-brand-800" aria-hidden="true">
            <Icon name="clipboard" className="size-8" />
          </div>
          <p className="mt-3 text-base text-slate-700">{t('listEmpty')}</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {totals.lines.map((line) => (
              <Line key={line.drug.id} t={t} line={line}
                onPacks={(n) => onPacks(line.drug.id, n)} onRemove={() => onRemove(line.drug.id)} />
            ))}
            {totals.missing.map((id) => (
              <li key={id} className="flex items-center gap-3 rounded-3xl bg-slate-100 p-4 text-base text-slate-800 ring-1 ring-slate-200">
                <span className="flex-1">{t('missingDrug')}</span>
                <button type="button" onClick={() => onRemove(id)}
                  className="min-h-12 cursor-pointer rounded-full px-3 font-semibold text-ink active:bg-slate-200">{t('remove')}</button>
              </li>
            ))}
          </ul>
          <KendraLinks t={t} offline={offline} />
          <button type="button" onClick={onAskClear}
            className="min-h-12 cursor-pointer self-center rounded-full px-4 text-base font-semibold text-warn-700 active:bg-warn-50
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-warn-600/40">
            {t('clearAll')}
          </button>
        </>
      )}
    </section>
  )
}

/** Sticky bar above the tab bar: running totals, print, and the disclaimer. */
export function ListSummaryBar({ t, totals, onPrint }) {
  return (
    <div role="status" className="border-t border-slate-200 bg-white px-4 pb-3 pt-3 shadow-[0_-6px_16px_-8px_rgb(11_31_58/0.15)]
      lg:sticky lg:top-0 lg:rounded-3xl lg:border-0 lg:p-5 lg:shadow-sm lg:ring-1 lg:ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-base tabular-nums text-slate-500">
            <span className="sr-only">{t('totalBrand')}</span>
            <span className="line-through">{formatInr(totals.brand)}</span>
            <Icon name="arrowRight" className="size-4" />
            <span className="sr-only">{t('totalGeneric')}</span>
            <span className="text-xl font-extrabold text-brand-800">{formatInr(totals.generic)}</span>
          </p>
          <p className="mt-1 inline-flex flex-wrap gap-x-1.5 rounded-full bg-save-300 px-3 py-1 text-base font-bold text-ink">
            <span>{tNode(t, 'totalSave', 'amount', <AnimatedNumber key="n" value={totals.saved} format={formatInr} />)}</span>
            <span>· {t('percentCheaper', { percent: totals.percent })}</span>
          </p>
        </div>
        <button type="button" onClick={onPrint}
          className="flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-brand-700 px-4 text-base font-semibold text-white
            shadow-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
          <Icon name="printer" className="size-5" />{t('printShort')}
        </button>
      </div>
      <div className="mt-2"><Disclaimer t={t} /></div>
    </div>
  )
}
