import { useCountUp } from '../../lib/useCountUp.js'

/**
 * Counts from 0 up to `value` in under 300 ms (instant with reduced motion), then shows
 * the exact value. Used only for savings, never for a price, so no wrong price is ever shown.
 */
export default function AnimatedNumber({ value, format = String }) {
  const counted = useCountUp(value)
  return <span className="tabular-nums">{format(counted >= value ? value : Math.round(counted))}</span>
}
