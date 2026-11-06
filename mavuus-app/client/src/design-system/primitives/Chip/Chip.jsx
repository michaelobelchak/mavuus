import { cn } from '../../lib/cn'
import { CHIP_DEFAULT_SIZE, chipIconSizes, chipVariants } from './chipVariants'

/**
 * Selectable pill (filters, tags). Controlled: pass `selected` and toggle it in `onClick`.
 * `aria-pressed` is set only when `selected` is given, so a plain chip is a normal button.
 * Sizes are xs (32px) and sm (40px, default).
 */
export function Chip({
  selected,
  size,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  type = 'button',
  className,
  children,
  ref,
  ...props
}) {
  const iconClass = cn('shrink-0', chipIconSizes[size] ?? chipIconSizes[CHIP_DEFAULT_SIZE])
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected === undefined ? undefined : Boolean(selected)}
      className={cn(chipVariants({ selected: Boolean(selected), size }), className)}
      {...props}
    >
      {LeadingIcon && <LeadingIcon aria-hidden="true" className={iconClass} />}
      {children}
      {TrailingIcon && <TrailingIcon aria-hidden="true" className={iconClass} />}
    </button>
  )
}
