const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const dotSizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
}

const dotColors = {
  online: 'bg-green-500',
  away: 'bg-amber-500',
  offline: 'bg-neutral-300',
}

/**
 * Avatar
 * @param {string} src — image url
 * @param {string} name — full name (used for initials fallback)
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} pro — wrap in a brand gradient ring (Pro members)
 * @param {'online'|'away'|'offline'} status — bottom-right status dot
 */
export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  pro = false,
  status,
  className = '',
}) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const inner = (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-brand-pink/10 text-brand-pink flex items-center justify-center font-semibold">
          {initials}
        </div>
      )}
    </div>
  )

  const dot = status && (
    <span
      className={`absolute bottom-0 right-0 ${dotSizes[size]} ${dotColors[status] || dotColors.offline} rounded-full ring-2 ring-white`}
    />
  )

  if (pro) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="rounded-full p-[2px] bg-gradient-to-br from-brand-pink to-brand-blue">
          <div className="rounded-full p-[2px] bg-white">
            {inner}
          </div>
        </div>
        {dot}
      </div>
    )
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {inner}
      {dot}
    </div>
  )
}
