import { cva } from 'class-variance-authority'

export const TABS_VARIANTS = ['underline', 'pill']
export const TABS_SIZES = ['sm', 'md']
export const DEFAULT_TABS_VARIANT = 'underline'
export const DEFAULT_TABS_SIZE = 'md'

export const tabListVariants = cva('flex', {
  variants: {
    variant: {
      underline: 'gap-ds-lg border-b border-border-default',
      // Segmented control: a sunken track with the active tab raised on it.
      pill: 'inline-flex gap-ds-xxs rounded-control bg-surface-sunken p-ds-xxs',
    },
  },
  defaultVariants: { variant: DEFAULT_TABS_VARIANT },
})

export const tabVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-ds-xs font-semibold whitespace-nowrap',
    'text-text-secondary hover:text-text-primary data-[active]:text-text-primary',
    'transition-[color,background-color,border-color,box-shadow] duration-150 ease-enter motion-reduce:transition-none',
    'data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled data-[disabled]:hover:text-text-disabled',
  ],
  {
    variants: {
      variant: {
        // -mb-px lays the 2px rule over the list's bottom border.
        underline: '-mb-px border-b-2 border-transparent data-[active]:border-border-brand',
        pill: 'rounded-input px-ds-md data-[active]:bg-surface-raised data-[active]:shadow-card',
      },
      size: {
        sm: 'h-10 text-body-sm',
        md: 'h-12 text-body',
      },
    },
    defaultVariants: { variant: DEFAULT_TABS_VARIANT, size: DEFAULT_TABS_SIZE },
  },
)
