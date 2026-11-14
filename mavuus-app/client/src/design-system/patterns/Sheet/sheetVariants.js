import { cva } from 'class-variance-authority'
import { overlaySurfaceClass } from '../Dialog/dialogVariants'

export const SHEET_SIDES = ['left', 'right']
export const DEFAULT_SHEET_SIDE = 'right'
export const SHEET_SIZES = ['sm', 'md', 'lg']
export const DEFAULT_SHEET_SIZE = 'md'

// Full height side panel. Slides in from its side; with reduced motion it only fades.
// max-w-full keeps the 560px size inside small screens.
export const sheetVariants = cva(
  [
    overlaySurfaceClass,
    'fixed inset-y-0 h-full max-w-full overflow-y-auto p-ds-lg',
    'transition-[opacity,translate] duration-300 ease-enter',
    'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
    'motion-reduce:transition-opacity motion-reduce:data-[starting-style]:translate-x-0 motion-reduce:data-[ending-style]:translate-x-0',
  ],
  {
    variants: {
      // The rounded corner is on the inner edge, the one facing the page.
      side: {
        right: 'right-0 rounded-l-sheet data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
        left: 'left-0 rounded-r-sheet data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full',
      },
      size: {
        sm: 'w-80',
        md: 'w-100',
        lg: 'w-140',
      },
    },
    defaultVariants: { side: DEFAULT_SHEET_SIDE, size: DEFAULT_SHEET_SIZE },
  },
)
