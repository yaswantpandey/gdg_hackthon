import Icon from './Icon.jsx'

// Large rounded search field, docked above the tab bar so it sits under the thumb.
export default function SearchBar({ t, value, onChange, inputRef }) {
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur() }}>
      <label htmlFor="q" className="sr-only">{t('searchLabel')}</label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-brand-700" />
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
          aria-describedby="disclaimer"
          className={`h-14 w-full rounded-full border-2 border-slate-200 bg-slate-50 pl-12 ${value ? 'pr-14' : 'pr-4'} text-lg text-ink
            placeholder:text-slate-500 transition-colors duration-150 short:h-12
            focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-600/20
            [&::-webkit-search-cancel-button]:hidden`}
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); inputRef.current?.focus() }} aria-label={t('clear')}
            className="absolute right-1 top-1/2 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full
              text-slate-600 transition active:scale-95 active:bg-slate-200
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/40">
            <Icon name="x" />
          </button>
        )}
      </div>
    </form>
  )
}
