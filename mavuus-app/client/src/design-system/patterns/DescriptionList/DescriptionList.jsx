import { cn } from '../../lib/cn'

/**
 * Label and value pairs, one per row with the value on the right: the "Details" panels on detail
 * pages (type, category, duration).
 * - `items`: [{ key, label, value }]. Items with an empty value are skipped; nothing renders when
 *   none are left.
 * `className` and other props go to the `<dl>`.
 */
export function DescriptionList({ items = [], className, ref, ...props }) {
  const shown = items.filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
  if (shown.length === 0) return null
  return (
    <dl ref={ref} className={cn('flex flex-col gap-ds-xs text-body-sm', className)} {...props}>
      {shown.map((item, index) => (
        <div key={item.key ?? index} className="flex items-baseline justify-between gap-ds-md">
          <dt className="text-text-secondary">{item.label}</dt>
          <dd className="min-w-0 text-right font-semibold text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
