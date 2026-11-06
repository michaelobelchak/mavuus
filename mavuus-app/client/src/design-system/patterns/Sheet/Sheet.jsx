import { resolveOption } from '../../lib/resolveOption'
import { DialogClose, OverlayShell } from '../Dialog/OverlayShell'
import { DEFAULT_SHEET_SIDE, DEFAULT_SHEET_SIZE, SHEET_SIDES, SHEET_SIZES, sheetVariants } from './sheetVariants'

/**
 * Side drawer on Base UI Dialog, with the same API as Dialog: `trigger`, `open` / `defaultOpen` /
 * `onOpenChange`, `title` (required), `description`, `children`, `footer` and `dismissible`.
 * - `side`: right (default) or left. `size`: sm 320px, md 400px (default) or lg 560px wide, never
 *   wider than the screen.
 * Full height, rounded on the inner edge only. Slides in from its side; with reduced motion it only
 * fades. Close it from the footer with <SheetClose>. `ref`, `className` and other props go to the
 * popup (the element with role="dialog").
 */
export function Sheet({ side, size, ...props }) {
  const resolvedSide = resolveOption(side, SHEET_SIDES, DEFAULT_SHEET_SIDE, 'Sheet', 'side')
  const resolvedSize = resolveOption(size, SHEET_SIZES, DEFAULT_SHEET_SIZE, 'Sheet', 'size')
  return (
    <OverlayShell
      component="Sheet"
      popupClass={sheetVariants({ side: resolvedSide, size: resolvedSize })}
      {...props}
    />
  )
}

/** Closes the Sheet it sits in. Wrap one element, usually a footer Button. */
export function SheetClose(props) {
  return <DialogClose {...props} />
}
