import Icon from './Icon.jsx'

// Always on screen wherever prices are shown; never dismissible.
export default function Disclaimer({ t, compact = false }) {
  return (
    <p id="disclaimer" role="note"
      className={`flex gap-2 leading-snug text-slate-700 ${compact ? 'text-sm' : 'text-base'}`}>
      <Icon name="info" className="mt-0.5 size-4 shrink-0 text-slate-600" />
      <span>{t('disclaimer')}</span>
    </p>
  )
}
