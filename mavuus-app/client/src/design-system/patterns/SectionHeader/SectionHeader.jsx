import { cn } from '../../lib/cn'
import { Eyebrow, Heading, Text } from '../../primitives'

/**
 * Heading row for a section: eyebrow, title, description, and actions on the right
 * (they wrap under the title on small screens).
 * - `title`: an h2 by default. `level` (1 to 4) picks the tag and its matching size.
 * - `description`, `eyebrow`, `actions`. Other props go to the root.
 */
export function SectionHeader({ title, level = 2, description, eyebrow, actions, className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-ds-sm sm:flex-row sm:items-end sm:justify-between', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-ds-xs">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading level={level}>{title}</Heading>
        {description && (
          <Text tone="secondary" className="max-w-prose">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-ds-sm sm:shrink-0">{actions}</div>}
    </div>
  )
}
