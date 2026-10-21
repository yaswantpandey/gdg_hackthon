import { useEffect } from 'react'
import Icon from './Icon.jsx'

// Shown once, when the service worker has cached everything.
export default function ReadyToast({ t, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <p role="status" className="animate-rise mx-auto flex w-fit items-center gap-2 rounded-full bg-emerald-800 px-4 py-2
      text-sm font-semibold text-white shadow-lg">
      <Icon name="check" className="size-4 shrink-0" />
      {t('offlineReady')}
    </p>
  )
}
