import { useSyncExternalStore } from 'react'

/** true while the CSS media query matches; updates live when the window is resized. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Laptop and desktop: same breakpoint as Tailwind's `lg:`. */
export const DESKTOP_QUERY = '(min-width: 1024px)'
