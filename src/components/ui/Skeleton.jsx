// Grey placeholder with a moving sheen (transform only); static when reduced motion is on.
export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-200 ${className}`} aria-hidden="true">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

/** Card-shaped placeholder matching a list row or result card. */
export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4" aria-hidden="true">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="mt-3 h-10 w-3/5" />
      <Skeleton className="mt-3 h-4 w-4/5" />
    </div>
  )
}
