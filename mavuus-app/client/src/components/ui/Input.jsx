import { forwardRef } from 'react'

const base = `
  w-full px-4 py-3 rounded-xl border bg-white
  text-neutral-600 placeholder:text-neutral-300
  focus:outline-none
  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30
  transition-all duration-200
`

const errorClasses = `
  border-red-400 focus:border-red-500 focus:ring-red-500/30 animate-shake
`

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-blue">{label}</label>
      )}
      <input
        ref={ref}
        className={`
          ${base}
          ${error ? errorClasses : 'border-neutral-200'}
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
        <label className="text-sm font-medium text-dark-blue">{label}</label>
      )}
      <textarea
        className={`
          ${base} resize-none
          ${error ? errorClasses : 'border-neutral-200'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
