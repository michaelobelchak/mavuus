import { cva } from 'class-variance-authority'

export const BADGE_DEFAULT_SIZE = 'md'

// Icon size per badge size; keys match the size variant.
export const badgeIconSizes = { sm: 'size-3', md: 'size-3.5' }

export const badgeVariants = cva('inline-flex items-center gap-ds-xxs rounded-chip font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-surface-sunken text-text-secondary',
      brand: 'bg-surface-selected text-text-brand-strong',
      success: 'bg-status-success-subtle text-status-success',
      warning: 'bg-status-warning-subtle text-status-warning',
      error: 'bg-status-error-subtle text-status-error',
      info: 'bg-status-info-subtle text-status-info',
      // Dark count bubble on busy or light surfaces (notification counts).
      inverse: 'bg-surface-inverse text-text-on-brand',
    },
    size: {
      sm: 'h-6 px-ds-xs text-caption',
      md: 'h-7 px-ds-sm text-body-sm',
    },
  },
  defaultVariants: { tone: 'neutral', size: BADGE_DEFAULT_SIZE },
})
