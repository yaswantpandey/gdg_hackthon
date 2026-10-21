import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../Icon.jsx'

const DISMISS_DRAG_PX = 90

/**
 * Bottom sheet used instead of modals: slides up from the tab bar, closes with the
 * ✕ button, a tap on the dimmed backdrop, Escape, or a downward swipe on the grabber.
 * The rest of the app should be made `inert` while it is open (see App).
 */
export default function BottomSheet({ t, title, onClose, children }) {
  const titleId = useId()
  const heading = useRef(null)
  const [drag, setDrag] = useState(0)
  const dragStart = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    heading.current?.focus({ preventScroll: true })
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true }) // give focus back to what opened the sheet
    }
  }, [onClose])

  // Swipe-to-dismiss follows the finger with transform only.
  const onPointerDown = (e) => { dragStart.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId) }
  const onPointerMove = (e) => { if (dragStart.current !== null) setDrag(Math.max(0, e.clientY - dragStart.current)) }
  const onPointerUp = () => {
    if (drag > DISMISS_DRAG_PX) onClose()
    dragStart.current = null
    setDrag(0)
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="animate-fade-in absolute inset-0 bg-ink/55" onClick={onClose} aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby={titleId}
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
        className="animate-sheet-in relative flex max-h-[92dvh] w-full max-w-[430px] flex-col rounded-t-3xl bg-white shadow-2xl">
        <div className="cursor-grab touch-none px-4 pt-2" onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300" aria-hidden="true" />
          <div className="mt-1 flex items-center gap-2">
            <h2 id={titleId} ref={heading} tabIndex={-1} className="flex-1 text-xl font-bold text-ink outline-none">{title}</h2>
            <button type="button" onClick={onClose} aria-label={t('close')}
              className="grid size-12 cursor-pointer place-items-center rounded-full text-slate-700 active:bg-slate-100
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
              <Icon name="x" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
