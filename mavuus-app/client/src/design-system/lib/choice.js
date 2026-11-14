// Shared layout for Checkbox, Radio and Switch.
// The label row is at least 44px tall so the whole row is the touch target.
export const choiceLabelClass = [
  'inline-flex min-h-11 cursor-pointer items-center gap-ds-xs text-body text-text-primary select-none',
  'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-text-disabled',
].join(' ')

// Grows the hit area of a 20px box to 44px when it renders without a label row.
export const choiceHitArea = 'relative after:absolute after:-inset-3 after:content-[""]'

// Error border for Checkbox and Radio. Repeated under data-[checked] and data-[indeterminate]
// so it wins over the selected border.
export const choiceInvalidClass =
  'border-status-error data-[checked]:border-status-error data-[indeterminate]:border-status-error'
