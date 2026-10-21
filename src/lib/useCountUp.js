import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Animates 0 → target with ease-out. Jumps straight to target when reduced motion is on. */
export function useCountUp(target, durationMs = 700) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) return setValue(target)
    let frame
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
