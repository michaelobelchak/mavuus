export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-xl ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <Skeleton className="h-36 mb-4" />
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      ))}
    </div>
  )
}
