import { Progress } from '@base-ui/react/progress'
import { cn } from '../../lib/cn'
import { warnOnce } from '../../lib/warnOnce'
import { progressIndicatorVariants, progressTrackVariants } from './progressBarVariants'

/**
 * Determinate progress bar built on Base UI Progress (role="progressbar" with aria-valuenow/max).
 * - `value`, `max` (default 100). Pass `value={null}` for an indeterminate bar.
 * - `label`: names the bar. Shown above it, or sr-only with `hideLabel`.
 * - `showValue`: shows the percentage next to the label.
 * - `tone`: brand (default), success, warning or error. `size`: sm (4px) or md (8px, default).
 */
export function ProgressBar({ value, max = 100, label, hideLabel = false, showValue = false, tone, size, className, ref, ...props }) {
  if (!label && !props['aria-label'] && !props['aria-labelledby']) {
    warnOnce('ProgressBar:accessible-name', 'ProgressBar: pass label, aria-label or aria-labelledby so it has an accessible name.')
  }
  const hasHeader = label && (!hideLabel || showValue)
  return (
    <Progress.Root ref={ref} value={value} max={max} className={cn('flex w-full flex-col gap-ds-xxs', className)} {...props}>
      {label && hideLabel && !showValue && <Progress.Label className="sr-only">{label}</Progress.Label>}
      {hasHeader && (
        <div className="flex items-center justify-between gap-ds-xs text-body-sm">
          <Progress.Label className={cn('font-semibold text-text-primary', hideLabel && 'sr-only')}>{label}</Progress.Label>
          {showValue && <Progress.Value className="text-text-secondary tabular-nums" />}
        </div>
      )}
      <Progress.Track data-progress-track="" className={progressTrackVariants({ size })}>
        <Progress.Indicator data-progress-indicator="" className={progressIndicatorVariants({ tone })} />
      </Progress.Track>
    </Progress.Root>
  )
}
