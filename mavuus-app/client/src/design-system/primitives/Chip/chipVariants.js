import { cva } from 'class-variance-authority'
import { controlHeights, controlIconSizes } from '../../lib/controlSizes'

// Chips are small filter controls, so they use the xs and sm steps of the control scale.
export const CHIP_DEFAULT_SIZE = 'sm'
export const CHIP_SIZES = ['xs', 'sm']

export const chipIconSizes = { xs: controlIconSizes.xs, sm: controlIconSizes.sm }

export const chipVariants = cva(
  [
    'inline-flex items-center justify-center gap-ds-xxs rounded-chip border font-semibold whitespace-nowrap',
    'transition-[background-color,color,border-color] duration-150 ease-enter motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:opacity-60',
  ],
  {
    variants: {
      selected: {
        true: 'bg-surface-selected border-border-brand text-text-brand-strong',
        false:
          'bg-surface-raised border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary',
      },
      size: {
        xs: `${controlHeights.xs} px-ds-sm text-caption`,
        sm: `${controlHeights.sm} px-ds-md text-body-sm`,
      },
    },
    defaultVariants: { selected: false, size: CHIP_DEFAULT_SIZE },
  },
)
