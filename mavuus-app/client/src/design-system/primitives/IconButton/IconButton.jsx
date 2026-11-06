import { useEffect } from 'react'
import { cn } from '../../lib/cn'
import { controlIconSizes, resolveControlSize } from '../../lib/controlSizes'
import { warnOnce } from '../../lib/warnOnce'
import { iconButtonVariants } from './iconButtonVariants'

/**
 * Square icon-only button on the control size scale (sm 40, md 48, lg 56).
 * Needs `aria-label` (or `aria-labelledby`) because the icon has no visible text.
 */
export function IconButton({ icon: Icon, variant, size, type = 'button', className, ref, ...props }) {
  const resolvedSize = size === 'xs' ? 'md' : resolveControlSize(size)
  const label = props['aria-label']
  const labelledBy = props['aria-labelledby']

  useEffect(() => {
    if (!label && !labelledBy) {
      warnOnce('IconButton:aria-label', 'IconButton: pass an aria-label so screen readers can announce this button.')
    }
  }, [label, labelledBy])

  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size: resolvedSize }), className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className={controlIconSizes[resolvedSize]} />}
    </button>
  )
}
