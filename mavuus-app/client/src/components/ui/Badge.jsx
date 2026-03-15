const variants = {
  pink: 'bg-brand-pink/10 text-brand-pink',
  blue: 'bg-brand-blue/10 text-brand-blue',
  gray: 'bg-neutral-100 text-neutral-600',
  green: 'bg-green-50 text-green-600',
}

export default function Badge({ children, variant = 'pink', className = '' }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
