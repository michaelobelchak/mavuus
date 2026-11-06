import { cva } from 'class-variance-authority'

// Color tones shared by Heading and Text. `brand` uses text-brand-strong so body copy keeps
// 4.5:1 contrast; the lighter pink (text-brand) is only for Eyebrow.
export const textTones = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  brand: 'text-text-brand-strong',
  link: 'text-text-link',
  'on-brand': 'text-text-on-brand',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
  info: 'text-status-info',
}

export const headingVariants = cva('text-balance', {
  variants: {
    size: {
      display: 'text-display font-bold',
      h1: 'text-h1 font-bold',
      h2: 'text-h2 font-bold',
      h3: 'text-h3 font-semibold',
      h4: 'text-h4 font-semibold',
    },
    tone: textTones,
  },
  defaultVariants: { size: 'h2', tone: 'primary' },
})

export const textVariants = cva('', {
  variants: {
    size: {
      lead: 'text-lead',
      body: 'text-body',
      'body-sm': 'text-body-sm',
      caption: 'text-caption',
    },
    tone: textTones,
  },
  defaultVariants: { size: 'body', tone: 'primary' },
})

export const eyebrowVariants = cva('text-body-sm font-semibold tracking-widest uppercase', {
  variants: {
    tone: {
      brand: 'text-text-brand',
      'brand-strong': 'text-text-brand-strong',
      muted: 'text-text-muted',
    },
  },
  defaultVariants: { tone: 'brand' },
})
