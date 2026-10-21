import { useEffect } from 'react'
import Icon from '../Icon.jsx'

/**
 * Snackbar-style toast: announced politely, never steals focus, auto-dismisses after 4 s.
 * Optional action (e.g. "Undo"). `toast` = { id, message, icon?, actionLabel?, onAction? }.
 */
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDone])

  return (
    <div role="status" className="animate-rise pointer-events-auto mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl
      bg-ink py-2 pl-4 pr-2 text-base text-white shadow-xl">
      <Icon name={toast.icon ?? 'check'} className="size-5 shrink-0 text-brand-200" />
      <span className="min-w-0 flex-1 py-1.5">{toast.message}</span>
      {toast.actionLabel && (
        <button type="button" onClick={() => { toast.onAction(); onDone() }}
          className="min-h-12 shrink-0 cursor-pointer rounded-xl px-3 font-bold text-save-300 active:bg-white/10
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-save-300/50">
          {toast.actionLabel}
        </button>
      )}
    </div>
  )
}
