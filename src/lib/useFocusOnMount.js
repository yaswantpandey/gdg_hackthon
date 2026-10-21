import { useEffect, useRef } from 'react'

/**
 * Moves focus to an element (a screen's heading) when it appears, so keyboard and
 * screen-reader users land on the new screen instead of being left on <body>.
 * Give the element tabIndex={-1}.
 */
export function useFocusOnMount() {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])
  return ref
}
