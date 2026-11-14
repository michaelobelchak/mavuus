import { cn } from '../../../lib/cn'
import { Icon } from '../../../primitives'

/**
 * Row of small facts under a card title: location, job type, duration, read time.
 * - `items`: [{ key, icon, label }]. `icon` is a lucide component, shown decorative at 16px.
 *   Items without a label are skipped, and nothing renders when none are left.
 * `className` and other props go to the `<ul>`.
 */
export function MetaList({ items = [], className, ref, ...props }) {
  const shown = items.filter((item) => item && item.label !== undefined && item.label !== null && item.label !== '')
  if (shown.length === 0) return null
  return (
    <ul
      ref={ref}
      className={cn('flex min-w-0 max-w-full flex-wrap items-center gap-x-ds-md gap-y-ds-xxs text-body-sm text-text-muted', className)}
      {...props}
    >
      {shown.map((item, index) => (
        <li key={item.key ?? index} className="inline-flex min-w-0 max-w-full items-center gap-ds-xxs">
          {item.icon && <Icon icon={item.icon} size="sm" />}
          <span className="truncate">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
