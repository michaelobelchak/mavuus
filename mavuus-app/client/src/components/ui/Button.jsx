import { forwardRef } from 'react'

const variants = {
  primary: 'bg-brand-pink text-white hover:bg-brand-pink-hover hover:shadow-[0_0_24px_rgba(242,109,146,0.25)] shadow-sm',
  secondary: 'border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white',
  outline: 'border border-neutral-300 text-neutral-600 hover:border-brand-pink hover:text-brand-pink',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      pill = false,
      loading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`
          relative inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-150
          hover:scale-[1.02] active:scale-[0.98]
          ${pill ? 'rounded-full' : 'rounded-[16px]'}
          ${variants[variant]}
          ${sizes[size]}
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
          cursor-pointer
          ${className}
        `}
        {...props}
      >
        {loading && (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
        )}
        <span className={loading ? 'opacity-80' : ''}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
