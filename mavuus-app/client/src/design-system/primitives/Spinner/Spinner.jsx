import { useId } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveControlSize } from '../../lib/controlSizes'
import { ICON_SIZES, iconSizes } from '../../lib/iconSizes'

/**
 * Loading indicator. Renders role="status" with an sr-only `label` (default "Loading"),
 * which also names the status, so screen readers announce it.
 * Sizes are sm 16px, md 20px (default) and lg 24px.
 * The spin stops when the user prefers reduced motion.
 * `announce={false}` drops the status role and keeps the sr-only label as plain text, for use
 * inside a control that already announces its state (Button's `loading`).
 */
export function Spinner({ size, label = 'Loading', announce = true, className, ref, ...props }) {
  const labelId = useId()
  const resolvedSize = resolveControlSize(size, ICON_SIZES, 'md', 'Spinner')
  return (
    <span
      ref={ref}
      data-spinner=""
      role={announce ? 'status' : undefined}
      aria-labelledby={announce ? labelId : undefined}
      className={cn('inline-flex text-current', className)}
      {...props}
    >
      <Loader2 aria-hidden="true" className={cn(iconSizes[resolvedSize], 'animate-spin motion-reduce:animate-none')} />
      <span id={labelId} className="sr-only">
        {label}
      </span>
    </span>
  )
}
