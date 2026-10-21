import Icon from './Icon.jsx'

// Always on screen, never dismissible.
export default function Disclaimer({ t }) {
  return (
    <p role="note" className="flex gap-2 text-sm leading-snug text-slate-700">
      <Icon name="info" className="mt-0.5 size-4 shrink-0 text-slate-600" />
      {t('disclaimer')}
    </p>
  )
}
