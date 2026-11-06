import { cva } from 'class-variance-authority'

export const progressTrackVariants = cva('relative w-full overflow-hidden rounded-chip bg-surface-sunken', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
    },
  },
  defaultVariants: { size: 'md' },
})

export const progressIndicatorVariants = cva(
  'block h-full rounded-chip transition-[width] duration-300 ease-move motion-reduce:transition-none',
  {
    variants: {
      tone: {
        brand: 'bg-surface-brand-strong',
        success: 'bg-status-success',
        warning: 'bg-status-warning',
        error: 'bg-status-error',
      },
    },
    defaultVariants: { tone: 'brand' },
  },
)
