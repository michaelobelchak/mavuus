import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/mergeRefs'
import { warnOnce } from '../../lib/warnOnce'

function hasAccessibleName(element) {
  if (!element) return true
  const label = element.getAttribute('aria-label')
  if (label && label.trim()) return true
  if (element.getAttribute('aria-labelledby')) return true
  return Boolean(element.textContent.trim())
}

/**
 * Short hint on hover and keyboard focus, built on Base UI Tooltip.
 * - `children`: a single element that takes a ref (Button, IconButton, Link...). It becomes the trigger.
 * - `content`: the hint. Keep it short and never put the only copy of important info here.
 * - `side`: top (default), bottom, left or right. `delay`: ms before it opens on hover (default 600).
 * - `popupClassName` styles the popup. Other props go to the trigger.
 *
 * The content is always in the DOM in a hidden element that the trigger points at with
 * aria-describedby, so screen readers get the hint whether or not the popup is open. The visual
 * popup is aria-hidden so the hint is announced once. The trigger still needs its own accessible
 * name (dev warning if it has none). Escape closes it. The fade turns off with reduced motion.
 */
export function Tooltip({
  content,
  side = 'top',
  delay,
  open,
  defaultOpen,
  onOpenChange,
  popupClassName,
  children,
  ref,
  ...props
}) {
  const descriptionId = useId()
  const triggerRef = useRef(null)
  const describedBy = [children?.props?.['aria-describedby'], props['aria-describedby'], descriptionId]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    if (!hasAccessibleName(triggerRef.current)) {
      warnOnce(
        'Tooltip:accessible-name',
        'Tooltip: the trigger has no accessible name. Give it text, aria-label or aria-labelledby; the tooltip only describes it.',
      )
    }
  })

  return (
    <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <TooltipPrimitive.Trigger
        ref={mergeRefs(triggerRef, ref)}
        delay={delay}
        // The child's own props win over Trigger props in Base UI, so merge the description into it.
        render={isValidElement(children) ? cloneElement(children, { 'aria-describedby': describedBy }) : children}
        {...props}
        aria-describedby={describedBy}
      />
      <span id={descriptionId} hidden>
        {content}
      </span>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={8} className="z-(--ds-z-tooltip)">
          <TooltipPrimitive.Popup
            data-tooltip-popup=""
            aria-hidden="true"
            className={cn(
              'max-w-xs rounded-tag bg-surface-inverse px-ds-xs py-ds-xxs text-caption text-text-on-brand shadow-float',
              'origin-(--transform-origin) transition-opacity duration-150 ease-enter',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
              'motion-reduce:transition-none',
              popupClassName,
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
