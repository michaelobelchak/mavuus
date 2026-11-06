import { cn } from '../../lib/cn'
import { BADGE_DEFAULT_SIZE, badgeIconSizes, badgeVariants } from './badgeVariants'

/** Small status label. `tone` carries the status meaning. Not interactive; use Chip for options. */
export function Badge({
  tone,
  size,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  className,
  children,
  ref,
  ...props
}) {
  const iconClass = cn('shrink-0', badgeIconSizes[size] ?? badgeIconSizes[BADGE_DEFAULT_SIZE])
  return (
    <span ref={ref} className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className={iconClass} />}
      {children}
      {TrailingIcon && <TrailingIcon aria-hidden="true" className={iconClass} />}
    </span>
  )
}
