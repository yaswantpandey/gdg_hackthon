import { useRef } from 'react'
import Icon from './Icon.jsx'

// Docked at the bottom of the screen so it sits under the thumb.
export default function SearchBar({ t, value, onChange }) {
  const input = useRef(null)

  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); input.current?.blur() }} // hide keyboard, reveal result
    >
      <label htmlFor="q" className="mb-1.5 block text-sm font-semibold text-slate-800">
        {t('searchLabel')}
      </label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-slate-500" />
        <input
          ref={input}
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
          className="h-16 w-full rounded-2xl border-2 border-slate-300 bg-white pl-13 pr-16 text-xl text-slate-900
            placeholder:text-slate-500 transition-colors duration-150
            focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/25
            [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); input.current?.focus() }}
            aria-label={t('clear')}
            className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-xl
              text-slate-600 transition active:scale-95 active:bg-slate-200
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/40"
          >
            <Icon name="x" />
          </button>
        )}
      </div>
    </form>
  )
}
