import Icon from './Icon.jsx'

// Reassures rather than warns: search still works with no signal.
export default function OfflineBar({ t }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
      <Icon name="wifiOff" className="size-4 shrink-0" />
      {t('offlineBadge')}
    </p>
  )
}
