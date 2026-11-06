// One height scale for every control. md is the default and meets the 44px touch target;
// sm is for dense desktop toolbars only. xs is for small filter chips.
export const controlHeights = { xs: 'h-8', sm: 'h-10', md: 'h-12', lg: 'h-14' }

// Square controls (IconButton) use the same steps.
export const controlSquares = { xs: 'size-8', sm: 'size-10', md: 'size-12', lg: 'size-14' }

// Icon size that matches each control size.
export const controlIconSizes = { xs: 'size-4', sm: 'size-4', md: 'size-5', lg: 'size-5' }

export function resolveControlSize(size) {
  return Object.hasOwn(controlHeights, size) ? size : 'md'
}
