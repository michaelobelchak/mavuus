import { cn } from '../../lib/cn'

/**
 * Separator line.
 * - `orientation`: horizontal (default, an <hr>) or vertical (stretches to the parent's height).
 * - `label`: short text in the middle of a horizontal divider, such as "or". It also names the separator.
 */
export function Divider({ orientation = 'horizontal', label, className, ref, ...props }) {
  if (orientation === 'vertical') {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px shrink-0 self-stretch bg-border-default', className)}
        {...props}
      />
    )
  }

  if (label) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-label={typeof label === 'string' ? label : undefined}
        className={cn(
          'flex items-center gap-ds-sm text-caption text-text-muted',
          'before:h-px before:flex-1 before:bg-border-default after:h-px after:flex-1 after:bg-border-default',
          className,
        )}
        {...props}
      >
        {label}
      </div>
    )
  }

  return <hr ref={ref} className={cn('w-full border-0 border-t border-border-default', className)} {...props} />
}
