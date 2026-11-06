import { isValidElement } from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { floatingPopupClass, MENU_ALIGNS, MENU_SIDES } from '../DropdownMenu/dropdownMenuVariants'

/**
 * Small non-modal panel anchored to a trigger, on Base UI Popover. Opens on click, Escape or an
 * outside click closes it and focus returns to the trigger.
 * - `trigger`: the element that opens it. `title` (optional): a heading that labels the popup.
 * - `children`: the content. Links and buttons inside are in the tab order.
 * - `side` (bottom by default) and `align` (center by default) place it.
 * - `open` / `defaultOpen` / `onOpenChange`.
 * `ref` and other props go to the trigger; `popupClassName` styles the popup (set a width here).
 */
export function Popover({
  trigger,
  title,
  side,
  align,
  open,
  defaultOpen,
  onOpenChange,
  popupClassName,
  children,
  ref,
  ...props
}) {
  const resolvedSide = resolveOption(side, MENU_SIDES, 'bottom', 'Popover', 'side')
  const resolvedAlign = resolveOption(align, MENU_ALIGNS, 'center', 'Popover', 'align')

  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger ref={ref} render={isValidElement(trigger) ? trigger : undefined} {...props}>
        {isValidElement(trigger) ? undefined : trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side={resolvedSide}
          align={resolvedAlign}
          sideOffset={8}
          className="z-(--ds-z-popover)"
        >
          <PopoverPrimitive.Popup
            className={cn(
              'flex max-h-(--available-height) max-w-(--available-width) flex-col gap-ds-xs overflow-y-auto p-ds-md text-body-sm',
              floatingPopupClass,
              popupClassName,
            )}
          >
            {title && (
              <PopoverPrimitive.Title className="m-ds-none text-body font-semibold text-text-primary">
                {title}
              </PopoverPrimitive.Title>
            )}
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
