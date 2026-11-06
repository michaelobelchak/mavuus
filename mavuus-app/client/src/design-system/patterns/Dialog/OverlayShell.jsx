import { isValidElement, useEffect } from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { warnOnce } from '../../lib/warnOnce'
import { IconButton } from '../../primitives'
import { overlayBackdropClass } from './dialogVariants'

const DISMISS_REASONS = ['escape-key', 'outside-press']

/**
 * The modal frame Dialog and Sheet share, on Base UI Dialog (focus trap, scroll lock, focus return,
 * outside content made inert). Not exported from the barrel: use Dialog or Sheet.
 * - `component` names the caller in dev warnings. `viewportClassName` places the popup,
 *   `popupClass` is the caller's resolved popup styling.
 * - Base UI Root options (`modal`, `onOpenChangeComplete`, `actionsRef`, `handle`, `triggerId`,
 *   `defaultTriggerId`) go to the Root; everything else goes to the Popup.
 */
export function OverlayShell({
  component,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  dismissible = true,
  modal,
  onOpenChangeComplete,
  actionsRef,
  handle,
  triggerId,
  defaultTriggerId,
  viewportClassName,
  popupClass,
  className,
  children,
  ref,
  ...props
}) {
  useEffect(() => {
    if (!title) {
      warnOnce(
        `${component}:title`,
        `${component}: pass a title. It is the dialog's accessible name and the heading people see first.`,
      )
    }
  }, [component, title])

  function handleOpenChange(nextOpen, details) {
    // Not dismissible: Escape and outside presses do nothing; actions in the footer close it.
    if (!nextOpen && !dismissible && DISMISS_REASONS.includes(details.reason)) {
      details.cancel()
      return
    }
    onOpenChange?.(nextOpen, details)
  }

  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!dismissible}
      modal={modal}
      onOpenChangeComplete={onOpenChangeComplete}
      actionsRef={actionsRef}
      handle={handle}
      triggerId={triggerId}
      defaultTriggerId={defaultTriggerId}
    >
      {isValidElement(trigger) && <DialogPrimitive.Trigger render={trigger} />}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={overlayBackdropClass} />
        <DialogPrimitive.Viewport className={cn('fixed inset-0 z-(--ds-z-modal) flex', viewportClassName)}>
          <DialogPrimitive.Popup ref={ref} className={cn(popupClass, className)} {...props}>
            {(title || description) && (
              <div className={cn('flex flex-col gap-ds-xxs', dismissible && 'pr-ds-xxl')}>
                {title && (
                  <DialogPrimitive.Title className="m-ds-none text-h4 font-semibold text-text-primary">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="m-ds-none text-body-sm text-text-secondary">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
            )}
            {children !== undefined && children !== null && (
              <div className="min-h-0 grow text-body text-text-primary">{children}</div>
            )}
            {footer && <div className="flex flex-wrap justify-end gap-ds-sm">{footer}</div>}
            {/* Last in the DOM so the first field, not the close button, gets the initial focus. */}
            {dismissible && (
              <DialogPrimitive.Close
                render={<IconButton icon={X} aria-label="Close" className="absolute top-ds-sm right-ds-sm" />}
              />
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * Closes the Dialog or Sheet it sits in. Wrap one element, usually a footer Button:
 * `<DialogClose><Button variant="ghost">Cancel</Button></DialogClose>`. Other props go to that element.
 */
export function DialogClose({ children, ...props }) {
  return <DialogPrimitive.Close render={children} {...props} />
}
