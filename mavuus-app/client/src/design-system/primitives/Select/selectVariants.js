import { cva } from 'class-variance-authority'
import { controlHeights, DEFAULT_CONTROL_SIZE } from '../../lib/controlSizes'

export const SELECT_SIZES = ['sm', 'md', 'lg']

// The trigger reuses the text field frame (lib/field.js) and adds the control height.
export const selectTriggerVariants = cva(
  'inline-flex items-center gap-ds-xs text-left data-[popup-open]:border-border-focus aria-disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: `${controlHeights.sm} px-ds-sm`,
        md: controlHeights.md,
        lg: controlHeights.lg,
      },
    },
    defaultVariants: { size: DEFAULT_CONTROL_SIZE },
  },
)
