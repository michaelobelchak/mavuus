export default function GlassCard({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.06)]
        ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
