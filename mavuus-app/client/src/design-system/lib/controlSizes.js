import { warnOnce } from './warnOnce'

// One height scale for every control. md is the default and meets the 44px touch target;
// sm is for dense desktop toolbars only. xs is for small filter chips.
export const controlHeights = { xs: 'h-8', sm: 'h-10', md: 'h-12', lg: 'h-14' }

// Square controls (IconButton) use the same steps.
export const controlSquares = { xs: 'size-8', sm: 'size-10', md: 'size-12', lg: 'size-14' }

// Icon size that matches each control size. Standalone icons (Icon, Spinner) use lib/iconSizes.js,
// where lg is 24px; inside controls lg stays at 20px so icons don't crowd the label.
export const controlIconSizes = { xs: 'size-4', sm: 'size-4', md: 'size-5', lg: 'size-5' }

export const DEFAULT_CONTROL_SIZE = 'md'

const SCALE = Object.keys(controlHeights)

/**
 * The one size resolver for every control.
 * - An allowed size is returned as is.
 * - A missing size returns `fallback` silently.
 * - A size on the scale that this component doesn't support returns the nearest allowed
 *   step (IconButton `xs` gives `sm`, Chip `md` gives `sm`) and warns in dev.
 * - Any other value returns `fallback` and warns in dev.
 */
export function resolveControlSize(size, allowed = SCALE, fallback = DEFAULT_CONTROL_SIZE, component = 'Control') {
  if (size === undefined || size === null) return fallback
  if (allowed.includes(size)) return size

  const index = SCALE.indexOf(size)
  if (index === -1) {
    warnOnce(
      `${component}:size:${size}`,
      `${component}: size "${size}" is not supported (use ${allowed.join(', ')}). Falling back to "${fallback}".`,
    )
    return fallback
  }

  const nearest = allowed.reduce((best, step) =>
    Math.abs(SCALE.indexOf(step) - index) < Math.abs(SCALE.indexOf(best) - index) ? step : best,
  )
  warnOnce(
    `${component}:size:${size}`,
    `${component}: size "${size}" is not supported (use ${allowed.join(', ')}). Falling back to "${nearest}".`,
  )
  return nearest
}
