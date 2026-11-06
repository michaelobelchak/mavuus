import { cva } from 'class-variance-authority'
import { controlHeights, DEFAULT_CONTROL_SIZE } from '../../lib/controlSizes'

// Base and variant styles are shared with iconButtonVariants.
export const buttonBase = [
  'inline-flex items-center justify-center gap-ds-xs rounded-control font-semibold whitespace-nowrap',
  'transition-[background-color,color,border-color,transform] duration-200 ease-enter',
  'active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0',
  'disabled:pointer-events-none disabled:opacity-60',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:translate-y-0',
]

export const buttonVariantStyles = {
  primary: 'bg-surface-brand text-text-on-brand hover:bg-surface-brand-hover shadow-button-brand',
  secondary: 'bg-surface-brand-strong text-text-on-brand hover:bg-surface-brand-strong-hover',
  outline:
    'border border-border-strong bg-transparent text-text-primary hover:border-border-brand hover:text-text-brand',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-hover',
  danger: 'bg-status-error text-text-on-brand hover:opacity-90',
}

export const buttonVariants = cva(buttonBase, {
  variants: {
    variant: buttonVariantStyles,
    size: {
      sm: `${controlHeights.sm} px-ds-md text-body-sm`,
      md: `${controlHeights.md} px-ds-xl text-body`,
      lg: `${controlHeights.lg} px-ds-xl text-body`,
    },
    block: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: DEFAULT_CONTROL_SIZE,
  },
})
