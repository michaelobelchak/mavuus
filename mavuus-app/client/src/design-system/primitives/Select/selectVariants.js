import { cva } from 'class-variance-authority'
import { controlHeights, DEFAULT_CONTROL_SIZE } from '../../lib/controlSizes'

export const SELECT_SIZES = ['sm', 'md', 'lg']

// The trigger reuses the text field frame (lib/field.js) and adds the control height.
export const selectTriggerVariants = cva(
  'inline-flex items-center gap-ds-xs text-left',
  {
    variants: {
      // The open border follows the invalid state so the error color stays visible while open.
      invalid: {
        true: 'data-[popup-open]:border-status-error',
        false: 'data-[popup-open]:border-border-focus',
      },
      size: {
        sm: `${controlHeights.sm} px-ds-sm`,
        md: controlHeights.md,
        lg: controlHeights.lg,
      },
    },
    defaultVariants: { invalid: false, size: DEFAULT_CONTROL_SIZE },
  },
)

// Items keep a transparent left border at rest so the navy highlight border doesn't shift the text.
export const selectItemClass = [
  'flex min-h-11 cursor-default items-center gap-ds-xs rounded-input border-l-2 border-transparent px-ds-sm text-body select-none',
  'data-[highlighted]:border-border-focus data-[highlighted]:bg-surface-selected data-[highlighted]:text-text-primary',
  'data-[selected]:font-semibold',
  'data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled',
].join(' ')
