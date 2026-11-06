import { cn } from '../../lib/cn'
import { controlHeights, controlIconSizes, DEFAULT_CONTROL_SIZE, resolveControlSize } from '../../lib/controlSizes'
import { fieldVariants, isInvalid } from '../../lib/field'

const SIZES = ['sm', 'md', 'lg']
const iconOffset = { sm: 'left-ds-xs', md: 'left-ds-md', lg: 'left-ds-md' }
const trailingIconOffset = { sm: 'right-ds-xs', md: 'right-ds-md', lg: 'right-ds-md' }
const leadingPadding = { sm: 'pl-ds-xl', md: 'pl-ds-xxl', lg: 'pl-ds-xxl' }

/**
 * Text input on the control height scale (sm 40, md 48, lg 56). `size` is the visual size,
 * not the native size attribute.
 * - `leadingIcon` / `trailingIcon`: lucide components, decorative.
 * - `trailing`: any node on the right, such as a unit or a clear button.
 * Props, `ref` and `className` go to the <input>. `wrapperClassName` styles the wrapper,
 * which only renders when an icon or `trailing` is given.
 */
export function Input({
  size,
  invalid = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  trailing,
  type = 'text',
  className,
  wrapperClassName,
  ref,
  ...props
}) {
  const resolvedSize = resolveControlSize(size, SIZES, DEFAULT_CONTROL_SIZE, 'Input')
  const ariaInvalid = props['aria-invalid']
  const invalidState = isInvalid(invalid, ariaInvalid)
  const hasTrailing = Boolean(TrailingIcon || trailing)
  const iconClass = cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted', controlIconSizes[resolvedSize])

  const input = (
    <input
      ref={ref}
      type={type}
      className={cn(
        fieldVariants({ invalid: invalidState, size: resolvedSize }),
        controlHeights[resolvedSize],
        LeadingIcon && leadingPadding[resolvedSize],
        hasTrailing && 'pr-ds-xxl',
        className,
      )}
      {...props}
      aria-invalid={invalidState ? true : ariaInvalid}
    />
  )

  if (!LeadingIcon && !hasTrailing) return input

  return (
    <div className={cn('relative', wrapperClassName)}>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className={cn(iconClass, iconOffset[resolvedSize])} />}
      {input}
      {TrailingIcon && !trailing && (
        <TrailingIcon aria-hidden="true" className={cn(iconClass, trailingIconOffset[resolvedSize])} />
      )}
      {trailing && (
        <div className="absolute inset-y-0 right-ds-xxs flex items-center pr-ds-xxs text-text-muted">{trailing}</div>
      )}
    </div>
  )
}
