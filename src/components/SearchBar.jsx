import { useRef } from 'react'
import Icon from './Icon.jsx'

// Docked at the bottom of the screen so it sits under the thumb.
export default function SearchBar({ t, value, onChange, inputRef, onPhoto, scanning }) {
  const fileInput = useRef(null)

  const pickPhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same photo again
    if (file) onPhoto(file)
  }

  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur() }} // hide keyboard, reveal result
    >
      <label htmlFor="q" className="mb-1.5 block text-sm font-semibold text-slate-800 short:sr-only">
        {t('searchLabel')}
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            id="q"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`h-16 w-full rounded-2xl border-2 border-slate-300 bg-white pl-10 ${value ? 'pr-13' : 'pr-3'} text-lg text-slate-900
              short:h-12
              placeholder:text-slate-500 transition-colors duration-150
              focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/25
              [&::-webkit-search-cancel-button]:hidden`}
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              aria-label={t('clear')}
              className="absolute right-1.5 top-1/2 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-xl
                text-slate-600 transition active:scale-95 active:bg-slate-200
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40"
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={scanning}
          className="flex h-16 w-[4.25rem] shrink-0 short:h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl bg-emerald-800
            text-white transition active:scale-95 disabled:cursor-wait disabled:opacity-50
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40"
        >
          <Icon name="camera" className="size-6" />
          <span className="text-xs font-semibold">{t('scan')}</span>
        </button>
        {/* capture="environment" opens the back camera straight away on Android. */}
        <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden onChange={pickPhoto} />
      </div>
    </form>
  )
}
