export default function Divider({ label, className = '' }) {
  if (!label) {
    return <hr className={`border-neutral-200 ${className}`} />
  }
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-neutral-200" />
      <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-300">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  )
}
