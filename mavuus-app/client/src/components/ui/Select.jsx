import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-dark-blue mb-1.5">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm appearance-none bg-white cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink
            ${error ? 'border-red-400' : 'border-neutral-200'}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
