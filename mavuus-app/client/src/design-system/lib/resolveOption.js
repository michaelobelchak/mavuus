import { warnOnce } from './warnOnce'

/**
 * Resolves a non-size variant prop (tone, level...). Sizes on the control scale use
 * resolveControlSize instead. A missing value returns `fallback`; an unknown one returns
 * `fallback` and warns in dev, naming the component, the prop and the value.
 */
export function resolveOption(value, allowed, fallback, component, prop) {
  if (value === undefined || value === null) return fallback
  if (allowed.includes(value)) return value
  warnOnce(
    `${component}:${prop}:${value}`,
    `${component}: ${prop} "${value}" is not supported (use ${allowed.join(', ')}). Falling back to "${fallback}".`,
  )
  return fallback
}

/**
 * Resolves a `headingLevel` prop (number or numeric string) through resolveOption, so every pattern
 * that renders a title heading uses the same prop name and the same dev warning.
 */
export function resolveHeadingLevel(level, allowed, fallback, component) {
  const value = level === undefined || level === null ? level : Number(level)
  return resolveOption(value, allowed, fallback, component, 'headingLevel')
}
