import Icon from './Icon.jsx'

// Sticks to the bottom of the result while you scroll, so "Add" is always under the thumb.
// On short (landscape) screens it flows normally instead, so it never covers the price.
export default function AddToListBar({ t, inList, onAdd, onOpenList }) {
  const base = `flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-lg font-semibold
    shadow-lg transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4`
  return (
    <div className="sticky bottom-0 z-10 -mx-4 bg-gradient-to-t from-slate-50 from-60% to-transparent px-4 pb-1 pt-5
      short:static short:bg-none short:pt-0 lg:static lg:mx-0 lg:bg-none lg:px-0 lg:pt-0">
      {inList ? (
        <button type="button" onClick={onOpenList}
          className={`${base} border-2 border-brand-700 bg-white text-brand-800 focus-visible:ring-brand-600/40`}>
          <Icon name="check" />{t('inList')}
        </button>
      ) : (
        <button type="button" onClick={onAdd} className={`${base} bg-brand-700 text-white focus-visible:ring-brand-600/40`}>
          <Icon name="plus" />{t('addToList')}
        </button>
      )}
    </div>
  )
}
