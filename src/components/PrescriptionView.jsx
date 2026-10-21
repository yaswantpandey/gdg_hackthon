import Icon from './Icon.jsx'
import KendraLinks from './KendraLinks.jsx'
import { formatInr } from '../lib/price.js'
import { MAX_PACKS } from '../lib/prescription.js'

const stepClass = `grid size-12 cursor-pointer place-items-center rounded-xl border-2 border-slate-300 text-slate-900
  transition active:scale-95 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40
  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40`

function TotalsHero({ t, totals }) {
  return (
    <div className="animate-rise rounded-3xl bg-emerald-50 p-5" role="status">
      <div className="flex items-end gap-3">
        <div>
          <div className="text-sm font-medium text-slate-700">{t('totalBrand')}</div>
          <div className="text-2xl font-semibold tabular-nums text-slate-600 line-through decoration-red-700 decoration-2">
            {formatInr(totals.brand)}
          </div>
        </div>
        <Icon name="arrowRight" className="mb-1.5 size-6 shrink-0 text-slate-500" />
        <div>
          <div className="text-sm font-medium text-emerald-900">{t('totalGeneric')}</div>
          <div className="text-4xl font-extrabold leading-none tabular-nums text-emerald-800">{formatInr(totals.generic)}</div>
        </div>
      </div>
      <p className="mt-3 inline-flex flex-wrap gap-x-2 rounded-full bg-amber-300 px-4 py-1.5 text-lg font-bold text-slate-900">
        <span className="tabular-nums">{t('totalSave', { amount: formatInr(totals.saved) })}</span>
        <span>·</span>
        <span>{t('percentCheaper', { percent: totals.percent })}</span>
      </p>
    </div>
  )
}

function Line({ t, line, onPacks, onRemove }) {
  const { drug, packs } = line
  return (
    <li className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900">{drug.brandName}</p>
          <p className="text-base text-slate-800">{drug.genericName}</p>
          <p className="text-sm text-slate-700">{drug.strength} · {t('pack', { count: drug.packSize, form: t.form(drug.form) })}</p>
        </div>
        <button type="button" onClick={onRemove} aria-label={t('removeA11y', { brand: drug.brandName })}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-600 active:bg-red-50 active:text-red-700
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/40">
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
          <span className="block text-sm text-slate-600 line-through">{formatInr(line.brand)}</span>
          <span className="block text-xl font-bold text-emerald-800">{formatInr(line.generic)}</span>
        </p>
      </div>
    </li>
  )
}

export default function PrescriptionView({ t, totals, offline, onBack, onPacks, onRemove, onClear, onPrint }) {
  const empty = totals.lines.length === 0 && totals.missing.length === 0
  return (
    <section className="flex flex-col gap-4" aria-labelledby="list-title">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label={t('back')}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl border-2 border-slate-300 bg-white active:bg-slate-100
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
          <Icon name="arrowLeft" />
        </button>
        <h2 id="list-title" className="text-2xl font-bold text-slate-900">{t('myList')}</h2>
      </div>

      {empty ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-base text-slate-800">{t('listEmpty')}</p>
      ) : (
        <>
          {totals.lines.length > 0 && <TotalsHero t={t} totals={totals} />}
          <ul className="flex flex-col gap-3">
            {totals.lines.map((line) => (
              <Line key={line.drug.id} t={t} line={line}
                onPacks={(n) => onPacks(line.drug.id, n)} onRemove={() => onRemove(line.drug.id)} />
            ))}
            {totals.missing.map((id) => (
              <li key={id} className="flex items-center gap-3 rounded-2xl border-2 border-slate-300 bg-slate-100 p-4 text-base text-slate-800">
                <span className="flex-1">{t('missingDrug')}</span>
                <button type="button" onClick={() => onRemove(id)}
                  className="min-h-12 cursor-pointer rounded-xl px-3 font-semibold text-slate-900 active:bg-slate-200">{t('remove')}</button>
              </li>
            ))}
          </ul>

          {totals.lines.length > 0 && (
            <button type="button" onClick={onPrint}
              className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-4 text-lg font-semibold
                text-white transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
              <Icon name="printer" />{t('print')}
            </button>
          )}
          <KendraLinks t={t} offline={offline} />
          <button type="button" onClick={() => window.confirm(t('clearConfirm')) && onClear()}
            className="min-h-12 cursor-pointer self-center rounded-xl px-4 text-base font-semibold text-red-700 active:bg-red-50
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/40">
            {t('clearAll')}
          </button>
        </>
      )}
    </section>
  )
}
