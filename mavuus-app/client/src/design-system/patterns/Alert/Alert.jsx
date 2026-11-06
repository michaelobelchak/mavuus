import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { IconButton } from '../../primitives'
import { ALERT_TONES, alertIconTones, alertRoles, alertVariants, DEFAULT_ALERT_TONE } from './alertVariants'

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle }

/**
 * Inline message about the page or a form.
 * - `tone`: info (default), success, warning or error. Info and success use role="status" (polite);
 *   warning and error use role="alert" (assertive). Each tone has its own icon, so color is never the only cue.
 * - `title`, `description`, and `children` for extra content (links, lists). `actions`: buttons on the right.
 * - `onDismiss`: shows a close button (`dismissLabel`, default "Dismiss") that calls it.
 * Other props go to the root.
 */
export function Alert({ layout = 'inline', ...props }) {
  return <AlertBase layout={layout} component="Alert" {...props} />
}

// Shared by Alert and Banner.
export function AlertBase({
  tone,
  layout,
  component,
  title,
  description,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  children,
  ref,
  ...props
}) {
  const resolvedTone = resolveOption(tone, ALERT_TONES, DEFAULT_ALERT_TONE, component, 'tone')
  const ToneIcon = icons[resolvedTone]
  return (
    <div
      ref={ref}
      role={alertRoles[resolvedTone]}
      className={cn(alertVariants({ tone: resolvedTone, layout }), className)}
      {...props}
    >
      <ToneIcon aria-hidden="true" className={cn('mt-ds-xxs size-5 shrink-0', alertIconTones[resolvedTone])} />
      <div className="flex min-w-0 grow flex-col gap-ds-xxs">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-text-secondary">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-ds-xs">{actions}</div>}
      {onDismiss && (
        <IconButton
          icon={X}
          aria-label={dismissLabel}
          className="-my-ds-sm -mr-ds-xs shrink-0"
          onClick={onDismiss}
        />
      )}
    </div>
  )
}
