import Icon from './Icon.jsx'

// Always on screen, never dismissible. "About this data" sits right beside it.
export default function Disclaimer({ t, onAbout }) {
  return (
    <p role="note" className="flex gap-2 text-sm leading-snug text-slate-700">
      <Icon name="info" className="mt-0.5 size-4 shrink-0 text-slate-600" />
      <span>
        {t('disclaimer')}{' '}
        <button type="button" onClick={onAbout}
          className="-my-3 inline cursor-pointer py-3 font-semibold text-emerald-800 underline underline-offset-2
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
          {t('aboutLink')}
        </button>
      </span>
    </p>
  )
}
