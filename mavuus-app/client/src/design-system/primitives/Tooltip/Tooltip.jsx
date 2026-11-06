import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn'

/**
 * Short hint on hover and keyboard focus, built on Base UI Tooltip.
 * - `children`: a single element that takes a ref (Button, IconButton, Link...). It becomes the trigger.
 * - `content`: the hint. Keep it short and never put the only copy of important info here.
 * - `side`: top (default), bottom, left or right. `delay`: ms before it opens on hover (default 600).
 * Base UI keeps tooltips visual only (no role or aria-describedby), so the trigger needs its
 * own accessible name, such as an IconButton aria-label. Escape closes it. The fade turns off when the user prefers reduced motion.
 */
export function Tooltip({ content, side = 'top', delay, children, className, open, defaultOpen, onOpenChange, ...props }) {
  return (
    <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <TooltipPrimitive.Trigger delay={delay} render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={8} className="z-(--ds-z-tooltip)">
          <TooltipPrimitive.Popup
            className={cn(
              'max-w-xs rounded-tag bg-surface-inverse px-ds-xs py-ds-xxs text-caption text-text-on-brand shadow-float',
              'origin-(--transform-origin) transition-opacity duration-150 ease-enter',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
              'motion-reduce:transition-none',
              className,
            )}
            {...props}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
