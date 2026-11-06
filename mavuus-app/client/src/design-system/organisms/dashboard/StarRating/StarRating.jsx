import { useId, useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveOption } from '../../../lib/resolveOption'

const starSizes = { sm: 'size-4', md: 'size-5', lg: 'size-6' }
const SIZES = Object.keys(starSizes)

const starClass = (filled, size) =>
  cn(starSizes[size], 'shrink-0', filled ? 'fill-current text-status-warning' : 'text-text-faint')

const spoken = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))
const starName = (count) => `${count} ${count === 1 ? 'star' : 'stars'}`

/**
 * Five-star rating for reviews and vendors.
 * - Read only (no `onChange`): one image named "4.5 out of 5 stars"; the stars fill up to the
 *   rounded value. `size` sm (16px, default), md or lg.
 * - Input (`onChange(value)`): a fieldset of native radios named "1 star" to "5 stars", so click,
 *   Tab and the arrow keys work as in any radio group. `label` names the group (default "Rating",
 *   visually hidden unless `showLabel`), `name` the radios. Each star is a 44px target; hovering
 *   previews the value. Defaults to lg.
 * `className` and other props go to the root.
 */
export function StarRating({ value = 0, max = 5, onChange, label = 'Rating', showLabel = false, name, size, className, ref, ...props }) {
  const interactive = typeof onChange === 'function'
  const resolvedSize = resolveOption(size, SIZES, interactive ? 'lg' : 'sm', 'StarRating', 'size')
  const [hovered, setHovered] = useState(0)
  const generatedName = useId()
  const stars = Array.from({ length: max }, (_, index) => index + 1)
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), max)

  if (!interactive) {
    const filledCount = Math.round(safeValue)
    return (
      <span
        ref={ref}
        role="img"
        aria-label={`${spoken(safeValue)} out of ${max} stars`}
        className={cn('inline-flex items-center gap-ds-none', className)}
        {...props}
      >
        {stars.map((star) => (
          <Star key={star} aria-hidden="true" data-filled={String(star <= filledCount)} className={starClass(star <= filledCount, resolvedSize)} />
        ))}
      </span>
    )
  }

  const shown = hovered || safeValue
  return (
    <fieldset ref={ref} className={cn('flex flex-col gap-ds-xxs', className)} onMouseLeave={() => setHovered(0)} {...props}>
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
              className="peer sr-only"
            />
            <Star aria-hidden="true" data-filled={String(star <= shown)} className={starClass(star <= shown, resolvedSize)} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
