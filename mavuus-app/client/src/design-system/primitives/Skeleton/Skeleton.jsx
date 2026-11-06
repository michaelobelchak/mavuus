import { cn } from '../../lib/cn'
import { skeletonPulse, skeletonVariants } from './skeletonVariants'

/**
 * Loading placeholder. Hidden from assistive tech: pair it with a Spinner or an aria-busy region
 * when the wait needs announcing.
 * - `shape`: text (default, `lines` bars with a shorter last line), circle or rect.
 * - Set width and height with `className` (circle defaults to 40px, rect to 96px tall).
 */
export function Skeleton({ shape, lines = 1, className, ref, ...props }) {
  const isText = (shape ?? 'text') === 'text'
  return (
    <div ref={ref} aria-hidden="true" className={cn(skeletonVariants({ shape }), className)} {...props}>
      {isText &&
        Array.from({ length: Math.max(1, lines) }, (_, index) => (
          <span
            key={index}
            className={cn(skeletonPulse, 'block h-4 rounded-tag', lines > 1 && index === lines - 1 ? 'w-3/5' : 'w-full')}
          />
        ))}
    </div>
  )
}
