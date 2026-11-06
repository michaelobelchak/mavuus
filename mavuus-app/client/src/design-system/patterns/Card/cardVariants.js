import { cva } from 'class-variance-authority'

export const CARD_VARIANTS = ['feature', 'surface', 'panel', 'panel-pink', 'media']
export const CARD_PADDINGS = ['none', 'sm', 'md', 'lg']
export const CARD_TAGS = ['div', 'article', 'section', 'li']
export const DEFAULT_CARD_VARIANT = 'feature'
export const DEFAULT_CARD_PADDING = 'lg'

// Also used for the body of a media card, below the image.
export const cardPaddings = {
  none: 'p-ds-none',
  sm: 'p-ds-sm',
  md: 'p-ds-md',
  lg: 'p-ds-lg',
}

export const cardVariants = cva('block rounded-card text-left', {
  variants: {
    variant: {
      // Stats, offering cards, proof boxes. `rule` adds the pink brand rule on the left.
      feature: 'border border-border-subtle bg-surface-raised shadow-card',
      // Neutral containers: forms, sidebars, FAQ groups.
      surface: 'border border-border-default bg-surface-raised',
      // Tinted blocks that group a whole section.
      panel: 'rounded-panel bg-surface-sunken',
      'panel-pink': 'rounded-panel bg-surface-selected',
      // Image on top, no root padding; the body below the image gets the padding.
      media: 'overflow-hidden border border-border-subtle bg-surface-raised shadow-card',
    },
    padding: cardPaddings,
    rule: {
      // The brand signature: a 4px pink rule on the left edge.
      true: 'border-l-4 border-l-border-brand',
      false: '',
    },
    interactive: {
      true: [
        'transition-[translate,box-shadow] duration-300 ease-enter',
        'hover:-translate-y-1 hover:shadow-card-hover',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      ],
      false: '',
    },
  },
  defaultVariants: { variant: DEFAULT_CARD_VARIANT, padding: DEFAULT_CARD_PADDING, rule: false, interactive: false },
})
