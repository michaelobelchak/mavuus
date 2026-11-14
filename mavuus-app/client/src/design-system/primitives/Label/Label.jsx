import { cn } from '../../lib/cn'
import { RequiredMark } from '../../lib/RequiredMark'

/**
 * Form label. Point it at a field with `htmlFor`.
 * `required` adds a visual asterisk (hidden from screen readers) and sr-only "(required)" text,
 * so the field's accessible name ends in "(required)".
 */
export function Label({ required = false, className, children, ref, ...props }) {
  return (
    <label ref={ref} className={cn('text-body-sm font-semibold text-text-primary', className)} {...props}>
      {children}
      {required && <RequiredMark />}
    </label>
  )
}
