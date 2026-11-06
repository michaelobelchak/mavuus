import { cva } from 'class-variance-authority'

// Shared frame for text fields (Input, Textarea).
export const fieldVariants = cva(
  [
    'w-full rounded-input border bg-surface-raised px-ds-md text-text-primary placeholder:text-text-muted',
    'transition-[border-color] duration-150 ease-enter motion-reduce:transition-none',
    'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-disabled',
  ],
  {
    variants: {
      invalid: {
        true: 'border-status-error focus:border-status-error',
        false: 'border-border-default hover:border-border-strong focus:border-border-focus',
      },
      size: {
        sm: 'text-body-sm',
        md: 'text-body',
      },
    },
    defaultVariants: { invalid: false, size: 'md' },
  },
)
