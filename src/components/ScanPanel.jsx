import Icon from './Icon.jsx'

// Three scan states shown above the results: reading, read (please check), failed.

const ERROR_KEYS = {
  offline: 'scanOffline',
  unreadable: 'scanUnreadable',
  too_large: 'scanBadPhoto',
  bad_type: 'scanBadPhoto',
  rate_limited: 'scanTooMany',
  busy: 'scanTooMany',
}

export function ScanReading({ t, previewUrl, onCancel }) {
  return (
    <section role="status" className="animate-rise flex items-center gap-3 rounded-2xl border-2 border-emerald-800/20 bg-white p-3">
      {/* Shown from memory only; never uploaded anywhere except the one OCR request. */}
      <img src={previewUrl} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent motion-reduce:animate-none" />
          {t('scanReading')}
        </p>
        <p className="text-sm text-slate-700">{t('scanReadingHint')}</p>
      </div>
      <button type="button" onClick={onCancel}
        className="min-h-12 shrink-0 cursor-pointer rounded-xl px-3 text-base font-semibold text-slate-700 active:bg-slate-100
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
        {t('cancel')}
      </button>
    </section>
  )
}

export function ScanRead({ t, text, onEdit }) {
  return (
    <section role="status" className="animate-rise flex items-center gap-3 rounded-2xl border-2 border-sky-700/30 bg-sky-50 p-3">
      <Icon name="camera" className="size-6 shrink-0 text-sky-800" />
      <p className="min-w-0 flex-1 text-base text-slate-900">
        {t('scanReadAs')} <strong className="break-words">“{text}”</strong>
        <span className="block text-sm text-slate-700">{t('scanCheck')}</span>
      </p>
      <button type="button" onClick={onEdit}
        className="min-h-12 shrink-0 cursor-pointer rounded-xl border-2 border-sky-800/40 bg-white px-3 text-base font-semibold
          text-sky-900 active:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700/40">
        {t('scanEdit')}
      </button>
    </section>
  )
}

export function ScanFailed({ t, reason, onType }) {
  return (
    <section role="alert" className="animate-rise rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
      <p className="flex gap-2 text-base text-slate-900">
        <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-amber-700" />
        {t(ERROR_KEYS[reason] ?? 'scanUnavailable')}
      </p>
      <button type="button" onClick={onType}
        className="mt-3 min-h-12 w-full cursor-pointer rounded-xl bg-emerald-800 px-4 text-base font-semibold text-white
          active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40">
        {t('scanTypeInstead')}
      </button>
    </section>
  )
}
