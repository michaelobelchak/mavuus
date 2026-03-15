export default function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div>
        {label && <span className="text-sm font-medium text-dark-blue">{label}</span>}
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
          ${checked ? 'bg-brand-pink' : 'bg-neutral-300'}
        `}
      >
        <span className={`
          inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `} />
      </button>
    </label>
  )
}
