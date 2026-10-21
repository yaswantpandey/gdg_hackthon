import Icon from './Icon.jsx'
import { formatInr } from '../lib/price.js'

// Sits just above the search box: the running total is always one tap away.
export default function ListChip({ t, count, saved, onOpen }) {
  return (
    <button type="button" onClick={onOpen}
      className="animate-rise flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl bg-amber-300 px-4 py-2 text-left
        text-slate-900 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/50">
      <Icon name="clipboard" className="size-6 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold">{t('myList')}</span>
        <span className="block text-sm tabular-nums">
          {t(count === 1 ? 'listChipOne' : 'listChip', { count, amount: formatInr(saved) })}
        </span>
      </span>
      <Icon name="chevronRight" className="size-6 shrink-0" />
    </button>
  )
}
