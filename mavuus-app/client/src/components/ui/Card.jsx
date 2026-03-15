export default function Card({ children, className = '', padding = true, hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-neutral-100
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover-lift' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardImage({ src, alt, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-t-2xl ${className}`}>
      <img src={src} alt={alt} className="w-full h-48 object-cover" />
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
