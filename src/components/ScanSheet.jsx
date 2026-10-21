// Lazy-loaded: this file (and the scan code it pulls in) downloads only when Scan is first opened.
import { useEffect, useRef, useState } from 'react'
import BottomSheet from './ui/BottomSheet.jsx'
import { Skeleton } from './ui/Skeleton.jsx'
import Icon from './Icon.jsx'
import { useScan } from '../lib/useScan.js'

const ERROR_KEYS = {
  offline: 'scanOffline', unreadable: 'scanUnreadable', too_large: 'scanBadPhoto', bad_type: 'scanBadPhoto',
  rate_limited: 'scanTooMany', busy: 'scanTooMany',
}

const primary = `flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-700 px-5 text-lg
  font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50
  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40`
const secondary = `flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-slate-200
  px-5 text-base font-semibold text-ink active:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40`

/** Camera-style frame: corner brackets, and a moving scan line while Gemma reads. */
function Viewfinder({ previewUrl, reading, hint }) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-3xl bg-ink">
      {previewUrl
        ? <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        : <div className="absolute inset-0 grid place-items-center text-white/70"><Icon name="image" className="size-12" /></div>}
      <div className="absolute inset-6" aria-hidden="true">
        {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl',
          'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl']
          .map((c) => <span key={c} className={`absolute size-8 border-save-300 ${c}`} />)}
        {/* Full-size overlay with the line on its top edge; moving it by 100% sweeps the frame. */}
        {reading && (
          <span className="animate-scan-line absolute inset-0">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-save-300 shadow-[0_0_12px_2px] shadow-save-300/70" />
          </span>
        )}
      </div>
      {!previewUrl && <p className="absolute inset-x-0 bottom-3 px-6 text-center text-sm font-medium text-white">{hint}</p>}
    </div>
  )
}

export default function ScanSheet({ t, offline, onClose, onSearch, onTypeInstead }) {
  const fileInput = useRef(null)
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null) // object URL kept only while the sheet shows it
  const { scan, start, cancel } = useScan(setText)

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPreview(URL.createObjectURL(file))
    start(file)
  }
  const takePhoto = () => fileInput.current?.click()
  const close = () => { cancel(); onClose() }

  return (
    <BottomSheet t={t} title={t('scanTitle')} onClose={close}>
      {/* capture="environment" opens the back camera straight away on Android. */}
      <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden onChange={pick} />

      <div className="flex flex-col gap-4">
        <Viewfinder previewUrl={scan.status === 'idle' ? null : preview} reading={scan.status === 'reading'} hint={t('scanHint')} />

        {scan.status === 'idle' && (
          <>
            {offline && <p className="rounded-2xl bg-warn-50 p-3 text-base text-warn-800" role="note">{t('scanOffline')}</p>}
            <button type="button" className={primary} onClick={takePhoto} disabled={offline}>
              <Icon name="camera" />{t('takePhoto')}
            </button>
          </>
        )}

        {scan.status === 'reading' && (
          <div role="status" className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-ink">{t('scanReading')}</p>
            <Skeleton className="h-14 w-full rounded-2xl" />
            <p className="text-sm text-slate-600">{t('scanReadingHint')}</p>
            <button type="button" className={secondary} onClick={cancel}>{t('cancel')}</button>
          </div>
        )}

        {scan.status === 'read' && (
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSearch(text.trim()) }}>
            <label htmlFor="scan-text" className="text-base font-semibold text-ink">{t('scanReadAs')}</label>
            {/* Untrusted model text: only ever an editable value; search checks it against our data. */}
            <input id="scan-text" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" spellCheck={false}
              className="h-14 w-full rounded-2xl border-2 border-brand-600 bg-white px-4 text-lg text-ink focus:outline-none
                focus:ring-4 focus:ring-brand-600/20" />
            <p className="text-sm text-slate-600">{t('scanCheck')}</p>
            <button type="submit" className={primary}><Icon name="search" />{t('searchThis')}</button>
            <button type="button" className={secondary} onClick={takePhoto}><Icon name="camera" className="size-5" />{t('retake')}</button>
          </form>
        )}

        {scan.status === 'failed' && (
          <div role="alert" className="flex flex-col gap-3">
            <p className="flex gap-2 rounded-2xl bg-warn-50 p-3 text-base text-ink">
              <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-warn-700" />{t(ERROR_KEYS[scan.reason] ?? 'scanUnavailable')}
            </p>
            <button type="button" className={secondary} onClick={takePhoto}><Icon name="camera" className="size-5" />{t('retake')}</button>
          </div>
        )}

        <button type="button" onClick={onTypeInstead}
          className="min-h-12 cursor-pointer rounded-full text-base font-semibold text-brand-800 underline underline-offset-4
            active:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
          {t('scanTypeInstead')}
        </button>
      </div>
    </BottomSheet>
  )
}
