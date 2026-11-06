import { cva } from 'class-variance-authority'

export const MENU_SIDES = ['top', 'bottom', 'left', 'right']
export const MENU_ALIGNS = ['start', 'center', 'end']

// Shared by DropdownMenu and Popover: the floating overlay surface and its fade and scale.
export const floatingPopupClass = [
  'rounded-control border border-border-default bg-surface-overlay text-text-primary shadow-overlay',
  'origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-enter',
  'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
  'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
  'motion-reduce:transition-none',
].join(' ')

// Same highlight as Select items: tinted background with the navy left indicator. Items keep a
// transparent left border at rest so the highlight doesn't shift the text.
export const menuItemVariants = cva(
  [
    'flex min-h-10 w-full cursor-default items-center gap-ds-xs rounded-input border-l-2 border-transparent px-ds-sm',
    'text-body-sm no-underline select-none',
    'data-[highlighted]:border-border-focus data-[highlighted]:bg-surface-selected',
    'data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled',
  ],
  {
    variants: {
      tone: {
        default: 'text-text-primary',
        danger: 'text-status-error',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)
