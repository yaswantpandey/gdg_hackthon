import { makeT } from '../i18n/index.js'
import { formatInr } from '../lib/price.js'

// Paper version of the list, to hand across the counter. Always bilingual (the
// patient may read Hindi, the pharmacist English), whatever the app language.
// Hidden on screen; it is the only thing that prints (see index.css).
const hi = makeT('hi')
const en = makeT('en')
const both = (key, vars) => `${hi(key, vars)} / ${en(key, vars)}`

export default function PrintSheet({ totals, isSample }) {
  if (!totals.lines.length) return null
  const sources = [...new Set(totals.lines.map((l) => l.drug.source))].join('; ')
  const updated = totals.lines.map((l) => l.drug.lastUpdated).sort().at(-1)
  const cell = 'border border-slate-400 px-2 py-1.5 text-left align-top'

  return (
    <article className="print-sheet hidden text-[12pt] text-black print:block">
      {isSample && (
        <p className="mb-3 border-2 border-black p-2 text-center font-bold">{both('printSampleWarning')}</p>
      )}
      <h1 className="text-[18pt] font-bold">{hi('printTitle')} · {en('printTitle')}</h1>
      <p className="mb-3">
        {both('printShow')} · {en('printDate')}: {new Date().toLocaleDateString('en-IN')}
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['colBrand', 'colGeneric', 'colStrength', 'colPacks', 'colBrandPrice', 'colGenericPrice'].map((k) => (
              <th key={k} className={`${cell} bg-slate-100`}>{hi(k)}<br />{en(k)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {totals.lines.map(({ drug, packs, brand, generic }) => (
            <tr key={drug.id}>
              <td className={cell}>{drug.brandName}</td>
              <td className={`${cell} font-bold`}>{drug.genericName}</td>
              <td className={cell}>{drug.strength}</td>
              <td className={cell}>{packs} × {drug.packSize}</td>
              <td className={cell}>{formatInr(brand)}</td>
              <td className={`${cell} font-bold`}>{formatInr(generic)}</td>
            </tr>
          ))}
          <tr>
            <td className={`${cell} font-bold`} colSpan={4}>{both('printTotal')}</td>
            <td className={`${cell} font-bold`}>{formatInr(totals.brand)}</td>
            <td className={`${cell} font-bold`}>{formatInr(totals.generic)}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-[14pt] font-bold">
        {both('printSaving', { amount: formatInr(totals.saved), percent: totals.percent })}
      </p>
      <p className="mt-2">{hi('printPrices', { sources, date: updated })}</p>
      <p>{en('printPrices', { sources, date: updated })}</p>

      <div className="mt-4 border-2 border-black p-2">
        <p className="font-bold">{hi('disclaimer')}</p>
        <p className="font-bold">{en('disclaimer')}</p>
      </div>
    </article>
  )
}
