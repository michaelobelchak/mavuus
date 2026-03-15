const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-brand-pink/10 text-brand-pink flex items-center justify-center font-semibold">
          {initials}
        </div>
      )}
    </div>
  )
}
