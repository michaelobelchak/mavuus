import { cva } from 'class-variance-authority'

export const skeletonPulse = 'bg-surface-sunken animate-pulse motion-reduce:animate-none'

export const skeletonVariants = cva('block', {
  variants: {
    shape: {
      text: 'flex w-full flex-col gap-ds-xs',
      circle: `${skeletonPulse} size-10 rounded-chip`,
      rect: `${skeletonPulse} h-24 w-full rounded-card`,
    },
  },
  defaultVariants: { shape: 'text' },
})
