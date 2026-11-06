import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { Heading, Text } from '../../primitives'

const sizes = {
  sm: { root: 'gap-ds-sm p-ds-lg', tile: 'size-10', icon: 'size-5', title: 'h4' },
  md: { root: 'gap-ds-md p-ds-xxl', tile: 'size-14', icon: 'size-6', title: 'h3' },
}
const SIZES = Object.keys(sizes)

/**
 * Placeholder for a list or page with nothing to show yet.
 * - `icon`: lucide component in a tinted round tile (decorative). `title`: heading (h3 by default,
 *   `headingLevel` 1 to 4). `description`: one or two sentences on what goes here or what to do.
 * - `actions`: buttons or links below the text. `size`: sm (inside cards) or md (default, a page).
 */
export function EmptyState({ icon: IconComponent, title, description, actions, headingLevel = 3, size, className, ref, ...props }) {
  const resolvedSize = resolveOption(size, SIZES, 'md', 'EmptyState', 'size')
  const style = sizes[resolvedSize]
  return (
    <div
      ref={ref}
      className={cn('flex flex-col items-center text-center', style.root, className)}
      {...props}
    >
      {IconComponent && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-chip bg-surface-sunken text-text-secondary',
            style.tile,
          )}
        >
          <IconComponent aria-hidden="true" className={style.icon} />
        </span>
      )}
      <div className="flex max-w-md flex-col gap-ds-xs">
        {title && (
          <Heading level={headingLevel} size={style.title}>
            {title}
          </Heading>
        )}
        {description && <Text tone="secondary">{description}</Text>}
      </div>
      {actions && <div className="flex flex-wrap items-center justify-center gap-ds-sm">{actions}</div>}
    </div>
  )
}
