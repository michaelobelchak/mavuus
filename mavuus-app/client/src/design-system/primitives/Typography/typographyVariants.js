import { cva } from 'class-variance-authority'

// One meaning per tone name across Heading, Text, Eyebrow and Caption. `brand` is the readable
// brand text (text-brand-strong, 5.74:1 on white). The light pink is only Eyebrow's `accent`.
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
export const TEXT_TONES = Object.keys(textTones)
export const DEFAULT_TEXT_TONE = 'primary'
export const DEFAULT_CAPTION_TONE = 'muted'
export const DEFAULT_EYEBROW_TONE = 'accent'
export const DEFAULT_TEXT_SIZE = 'body'

export const HEADING_LEVELS = [1, 2, 3, 4]
export const DEFAULT_HEADING_LEVEL = 2
// The look each level gets when `size` isn't given.
export const HEADING_SIZE_BY_LEVEL = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' }

const headingSizes = {
  display: 'text-display font-bold',
  h1: 'text-h1 font-bold',
  h2: 'text-h2 font-bold',
  h3: 'text-h3 font-semibold',
  h4: 'text-h4 font-semibold',
}
export const HEADING_SIZES = Object.keys(headingSizes)

export const headingVariants = cva('text-balance', {
  variants: { size: headingSizes, tone: textTones },
  defaultVariants: { size: HEADING_SIZE_BY_LEVEL[DEFAULT_HEADING_LEVEL], tone: DEFAULT_TEXT_TONE },
})

const textSizes = {
  lead: 'text-lead',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
}
export const TEXT_SIZES = Object.keys(textSizes)

export const textVariants = cva('', {
  variants: { size: textSizes, tone: textTones },
  defaultVariants: { size: DEFAULT_TEXT_SIZE, tone: DEFAULT_TEXT_TONE },
})

export const captionVariants = cva('text-caption', {
  variants: { tone: textTones },
  defaultVariants: { tone: DEFAULT_CAPTION_TONE },
})

// `accent` is the light pink (text-brand, 2.85:1 on white): decorative only, never the sole
// carrier of meaning.
const eyebrowTones = { ...textTones, accent: 'text-text-brand' }
export const EYEBROW_TONES = Object.keys(eyebrowTones)

export const eyebrowVariants = cva('text-body-sm font-semibold tracking-widest uppercase', {
  variants: { tone: eyebrowTones },
  defaultVariants: { tone: DEFAULT_EYEBROW_TONE },
})
