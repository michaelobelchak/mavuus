import { cva } from 'class-variance-authority'

export const DIALOG_SIZES = ['sm', 'md', 'lg']
export const DEFAULT_DIALOG_SIZE = 'md'

// Shared by Dialog and Sheet: the dimmed page behind a modal. Fades only, so no motion-reduce swap.
export const overlayBackdropClass = [
  'fixed inset-0 z-(--ds-z-overlay) bg-surface-inverse/50',
  'transition-opacity duration-200 ease-enter',
  'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
  'motion-reduce:transition-none',
].join(' ')

// Shared by Dialog and Sheet: the white modal surface.
export const overlaySurfaceClass = 'flex flex-col gap-ds-md bg-surface-overlay text-text-primary shadow-overlay'

// Centered dialog. Enters with a fade and a small scale; with reduced motion it only fades.
export const dialogVariants = cva(
  [
    overlaySurfaceClass,
    'relative max-h-full w-full overflow-y-auto rounded-sheet p-ds-lg',
    'transition-[opacity,scale] duration-200 ease-enter',
    'data-[starting-style]:scale-98 data-[starting-style]:opacity-0',
    'data-[ending-style]:scale-98 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
    'motion-reduce:transition-opacity motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: { size: DEFAULT_DIALOG_SIZE },
  },
)
