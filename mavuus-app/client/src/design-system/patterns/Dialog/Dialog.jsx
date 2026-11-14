import { resolveOption } from '../../lib/resolveOption'
import { DEFAULT_DIALOG_SIZE, DIALOG_SIZES, dialogVariants } from './dialogVariants'
import { DialogClose, OverlayShell } from './OverlayShell'

export { DialogClose }

/**
 * Modal dialog on Base UI Dialog. Focus moves inside on open, is trapped while open and returns to
 * the trigger on close. The page behind is dimmed, inert and doesn't scroll.
 * - `trigger`: the element that opens it (a Button). Leave it out and control `open` instead.
 * - `open` / `defaultOpen` / `onOpenChange(open, details)`.
 * - `title` (required, the accessible name, dev warning if missing), `description` (wired with
 *   aria-describedby), `children` (the body) and `footer` (actions; close with <DialogClose>).
 * - `size`: sm, md (default) or lg max width.
 * - `dismissible` (default true): Escape, a backdrop click and the "Close" button close it. When
 *   false the close button is hidden too, so the footer must hold an action that closes.
 * Fades and scales in; with reduced motion it only fades. `ref`, `className` and other props go to
 * the popup (the element with role="dialog").
 */
export function Dialog({ size, ...props }) {
  const resolvedSize = resolveOption(size, DIALOG_SIZES, DEFAULT_DIALOG_SIZE, 'Dialog', 'size')
  return (
    <OverlayShell
      component="Dialog"
      viewportClassName="items-center justify-center p-ds-md"
      popupClass={dialogVariants({ size: resolvedSize })}
      {...props}
    />
  )
}
