import { cn } from '../../lib/cn'
import { resolveControlSize } from '../../lib/controlSizes'
import { ICON_SIZES, iconSizes } from '../../lib/iconSizes'

/**
 * Standalone lucide icon. `icon` takes the component (not an element).
 * - Decorative by default: aria-hidden, ignored by screen readers.
 * - `label`: for an icon that carries meaning on its own. Renders role="img" with that aria-label.
 * Sizes are sm 16px, md 20px (default) and lg 24px. The icon inherits the text color.
 */
export function Icon({ icon: IconComponent, size, label, className, ref, ...props }) {
  const resolvedSize = resolveControlSize(size, ICON_SIZES, 'md', 'Icon')
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }
  if (!IconComponent) return null
  return <IconComponent ref={ref} className={cn('shrink-0', iconSizes[resolvedSize], className)} {...a11y} {...props} />
}
