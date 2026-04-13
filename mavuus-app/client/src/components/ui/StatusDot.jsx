const sizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }
const colors = {
  live: 'bg-green-500',
  online: 'bg-green-500',
  active: 'bg-brand-pink',
  inactive: 'bg-neutral-300',
}

export default function StatusDot({ status = 'inactive', size = 'md', className = '' }) {
  const colorClass = colors[status] || colors.inactive
  const sizeClass = sizes[size] || sizes.md
  const isPulsing = status === 'live' || status === 'online'

  return (
    <span className={`relative inline-flex ${className}`}>
      {isPulsing && (
        <span
          className={`absolute inline-flex w-full h-full rounded-full ${colorClass} opacity-60 animate-ping-soft`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${sizeClass} ${colorClass}`} />
    </span>
  )
}
