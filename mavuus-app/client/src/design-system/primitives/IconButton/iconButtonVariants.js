import { cva } from 'class-variance-authority'
import { controlSquares, DEFAULT_CONTROL_SIZE } from '../../lib/controlSizes'
import { buttonBase, buttonVariantStyles } from '../Button/buttonVariants'

export const ICON_BUTTON_SIZES = ['sm', 'md', 'lg']

export const iconButtonVariants = cva(buttonBase, {
  variants: {
    variant: buttonVariantStyles,
    size: {
      sm: controlSquares.sm,
      md: controlSquares.md,
      lg: controlSquares.lg,
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: DEFAULT_CONTROL_SIZE,
  },
})
