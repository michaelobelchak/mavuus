import { useId, useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveOption } from '../../../lib/resolveOption'

const starSizes = { sm: 'size-4', md: 'size-5', lg: 'size-6' }
const SIZES = Object.keys(starSizes)

// Filled stars use the rating role color; empty ones the muted text color (3:1 or more on white,
// enough for a non-text graphic).
const filledClass = 'fill-current text-status-rating'
const emptyClass = 'text-text-muted'

const spoken = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))
const starName = (count) => `${count} ${count === 1 ? 'star' : 'stars'}`

/** One star: full, half (a filled star clipped to its left half over an empty one) or empty. */
function StarShape({ fill, size }) {
  const sizeClass = starSizes[size]
  if (fill === 'half') {
    return (
      <span data-star="half" className={cn('relative inline-flex shrink-0', sizeClass)}>
        <Star aria-hidden="true" className={cn(sizeClass, emptyClass)} />
        <span className="absolute inset-y-ds-none left-ds-none w-1/2 overflow-hidden">
          <Star aria-hidden="true" className={cn(sizeClass, 'max-w-none', filledClass)} />
        </span>
      </span>
    )
  }
  return (
    <span data-star={fill} className={cn('inline-flex shrink-0', sizeClass)}>
      <Star aria-hidden="true" className={cn(sizeClass, fill === 'full' ? filledClass : emptyClass)} />
    </span>
  )
}

/**
 * Five-star rating for reviews and vendors.
 * - Read only (no `onChange`): one image named "4.5 out of 5 stars"; the stars fill to the
 *   nearest half star. `size` sm (16px, default), md or lg.
 * - Input (`onChange(value)`): a fieldset of native radios named "1 star" to "5 stars", so click,
 *   Tab and the arrow keys work as in any radio group. `label` names the group (default "Rating",
 *   visually hidden unless `showLabel`), `name` the radios. Each star is a 44px target; hovering
 *   previews the value. Defaults to lg.
 * `className` and other props (including your own `onMouseLeave`) go to the root.
 */
export function StarRating({
  value = 0,
  max = 5,
  onChange,
  label = 'Rating',
  showLabel = false,
  name,
  size,
  onMouseLeave,
  className,
  ref,
  ...props
}) {
  const interactive = typeof onChange === 'function'
  const resolvedSize = resolveOption(size, SIZES, interactive ? 'lg' : 'sm', 'StarRating', 'size')
  const [hovered, setHovered] = useState(0)
  const generatedName = useId()
  const stars = Array.from({ length: max }, (_, index) => index + 1)
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), max)

  if (!interactive) {
    const halves = Math.round(safeValue * 2) / 2
    const fillOf = (star) => (star <= halves ? 'full' : star - 0.5 === halves ? 'half' : 'empty')
    return (
      <span
        ref={ref}
        role="img"
        aria-label={`${spoken(safeValue)} out of ${max} stars`}
        onMouseLeave={onMouseLeave}
        className={cn('inline-flex items-center gap-ds-none', className)}
        {...props}
      >
        {stars.map((star) => (
          <StarShape key={star} fill={fillOf(star)} size={resolvedSize} />
        ))}
      </span>
    )
  }

  const shown = hovered || Math.round(safeValue)
  return (
    <fieldset
      ref={ref}
      className={cn('flex flex-col gap-ds-xxs', className)}
      onMouseLeave={(event) => {
        setHovered(0)
        onMouseLeave?.(event)
      }}
      {...props}
    >
      <legend className={cn(showLabel ? 'mb-ds-xxs text-body-sm font-semibold text-text-primary' : 'sr-only')}>{label}</legend>
      <div className="flex items-center">
        {stars.map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-control has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-border-focus"
          >
            <input
              type="radio"
              name={name ?? generatedName}
              value={star}
              checked={Math.round(safeValue) === star}
              onChange={() => onChange(star)}
              aria-label={starName(star)}
              className="sr-only"
            />
            <StarShape fill={star <= shown ? 'full' : 'empty'} size={resolvedSize} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
