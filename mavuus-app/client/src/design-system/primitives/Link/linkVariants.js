import { cva } from 'class-variance-authority'

export const linkVariants = cva(
  'text-text-link underline-offset-4 decoration-1 transition-colors duration-150 ease-enter hover:text-text-primary motion-reduce:transition-none',
  {
    variants: {
      variant: {
        inline: 'underline',
        standalone: 'no-underline hover:underline font-semibold',
      },
    },
    defaultVariants: { variant: 'inline' },
  },
)
