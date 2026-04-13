export default function Shimmer({ className = '', rounded = 'rounded-xl' }) {
  return <div className={`animate-shimmer ${rounded} ${className}`} />
}

export function ShimmerCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-100 p-4 ${className}`}>
      <Shimmer className="h-36 mb-4" />
      <Shimmer className="h-4 w-1/3 mb-3" rounded="rounded-md" />
      <Shimmer className="h-5 w-3/4 mb-2" rounded="rounded-md" />
      <Shimmer className="h-4 w-2/3" rounded="rounded-md" />
    </div>
  )
}
