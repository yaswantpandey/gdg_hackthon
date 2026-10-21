// Inline Lucide-style icons (MIT, lucide.dev): no icon font, nothing to download.
const PATHS = {
  search: ['M21 21l-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  chevronRight: ['m9 18 6-6-6-6'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16v-4', 'M12 8h.01'],
  alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  pill: ['m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z', 'm8.5 8.5 7 7'],
  searchX: ['M21 21l-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm13.5 8.5-5 5', 'm8.5 8.5 5 5'],
}

/** Decorative by default (aria-hidden); give the parent control the accessible name. */
export default function Icon({ name, className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  )
}
