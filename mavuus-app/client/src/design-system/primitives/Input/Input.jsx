import { cn } from '../../lib/cn'
import { fieldVariants } from './fieldVariants'

const heights = { sm: 'h-10', md: 'h-12' }
const iconSize = { sm: 'size-4', md: 'size-5' }
const iconOffset = { sm: 'left-ds-xs', md: 'left-ds-md' }
const leadingPadding = { sm: 'pl-ds-xl', md: 'pl-ds-xxl' }

/**
 * Text input. `size` is the visual size ('sm' | 'md'), not the native size attribute.
 * `leadingIcon` takes a lucide component; `trailing` takes any node (a unit, a clear button).
 * Props, `ref` and `className` go to the <input>; use `wrapperClassName` for the slot wrapper.
 */
export function Input({
  size = 'md',
  invalid = false,
  leadingIcon: LeadingIcon,
  trailing,
  type = 'text',
  className,
  wrapperClassName,
  ref,
  ...props
}) {
  const ariaInvalid = props['aria-invalid']
  const isInvalid = Boolean(invalid) || (Boolean(ariaInvalid) && ariaInvalid !== 'false')

  const input = (
    <input
      ref={ref}
      type={type}
      className={cn(
        fieldVariants({ invalid: isInvalid, size }),
        heights[size],
        LeadingIcon && leadingPadding[size],
        trailing && 'pr-ds-xxl',
        className,
      )}
      {...props}
      aria-invalid={isInvalid || undefined}
    />
  )

  if (!LeadingIcon && !trailing) return input

  return (
    <div className={cn('relative', wrapperClassName)}>
      {LeadingIcon && (
        <LeadingIcon
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted',
            iconOffset[size],
            iconSize[size],
          )}
        />
      )}
      {input}
      {trailing && (
        <div className="absolute inset-y-0 right-ds-xxs flex items-center pr-ds-xxs text-text-muted">{trailing}</div>
      )}
    </div>
  )
}
