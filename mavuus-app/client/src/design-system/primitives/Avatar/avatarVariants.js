import { cva } from 'class-variance-authority'

// size-8 = 32px, size-10 = 40px, size-14 = 56px
export const avatarVariants = cva('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-chip', {
  variants: {
    size: {
      sm: 'size-8 text-caption',
      md: 'size-10 text-body-sm',
      lg: 'size-14 text-lead',
    },
  },
  defaultVariants: { size: 'md' },
})
