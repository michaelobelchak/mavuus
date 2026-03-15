import { forwardRef } from 'react'

const variants = {
  primary: 'bg-brand-pink text-white hover:bg-brand-pink-hover shadow-sm',
  secondary: 'border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white',
  outline: 'border border-neutral-300 text-neutral-600 hover:border-brand-pink hover:text-brand-pink',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

const Button = forwardRef(({ children, variant = 'primary', size = 'md', pill = false, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 font-medium transition-all duration-200
        ${pill ? 'rounded-full' : 'rounded-[16px]'}
        ${variants[variant]}
        ${sizes[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
