import { cva } from 'class-variance-authority'

export const ALERT_TONES = ['info', 'success', 'warning', 'error']
export const DEFAULT_ALERT_TONE = 'info'
export const ALERT_LAYOUTS = ['inline', 'banner']
export const DEFAULT_ALERT_LAYOUT = 'inline'

// Polite status for good news and notes, assertive alert for problems that need attention.
export const alertRoles = { info: 'status', success: 'status', warning: 'alert', error: 'alert' }

export const alertIconTones = {
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
}

export const alertVariants = cva('flex items-start gap-ds-sm text-body-sm text-text-primary', {
  variants: {
    tone: {
      info: 'bg-status-info-subtle',
      success: 'bg-status-success-subtle',
      warning: 'bg-status-warning-subtle',
      error: 'bg-status-error-subtle',
    },
    layout: {
      // Inline: inside a page or form, next to what it is about.
      inline: 'rounded-card p-ds-md',
      // Banner: full width at the top of a page or the app.
      banner: 'w-full px-ds-lg py-ds-sm',
    },
  },
  defaultVariants: { tone: DEFAULT_ALERT_TONE, layout: DEFAULT_ALERT_LAYOUT },
})
