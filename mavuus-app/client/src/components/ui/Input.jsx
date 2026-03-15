import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-blue">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white
          text-neutral-600 placeholder:text-neutral-300
          focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink
          transition-colors duration-200
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-blue">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white
          text-neutral-600 placeholder:text-neutral-300
          focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink
          transition-colors duration-200 resize-none
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
