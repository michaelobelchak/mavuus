// Lookup tables for the foundations doc blocks. foundationMaps.test.js fails when tokens.js gains
// a step these don't cover.

// Display order for the space and radius steps.
export const SIZE_ORDER = [
  'none',
  'xxs',
  'xs',
  'sm',
  'md',
  'gutter-sm',
  'lg',
  'xl',
  'gutter',
  'xxl',
  'section-sm',
  'xxxl',
  'section-md',
  'section',
  'pill',
]

// Role names Tailwind exposes for each radius step (tokens.css `--radius-*`).
export const RADIUS_ROLES = { xs: 'tag', sm: 'input', md: 'control', lg: 'card', xl: 'sheet', xxl: 'panel', pill: 'chip' }

// Tailwind easing classes for each easing token (tokens.css `--ease-*`).
export const EASING_CLASSES = { out: 'ease-enter', in: 'ease-exit', 'in-out': 'ease-move' }

/** Token steps after `prefix` in tokens.js order, e.g. steps(tokens, 'ds-radius-'). */
export function steps(tokens, prefix) {
  return Object.keys(tokens)
    .filter((name) => name.startsWith(prefix))
    .map((name) => name.slice(prefix.length))
}
