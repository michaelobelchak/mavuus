import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center gap-ds-xxs rounded-chip font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-surface-sunken text-text-secondary',
      brand: 'bg-surface-selected text-text-brand-strong',
      success: 'bg-status-success-subtle text-status-success',
      warning: 'bg-status-warning-subtle text-status-warning',
      error: 'bg-status-error-subtle text-status-error',
      info: 'bg-status-info-subtle text-status-info',
    },
    size: {
      sm: 'h-6 px-ds-xs text-caption',
      md: 'h-7 px-ds-sm text-body-sm',
    },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
})

const iconSize = { sm: 'size-3', md: 'size-3.5' }

/** Small status label. Not interactive; use Chip for selectable options. */
export function Badge({ tone, size = 'md', icon: Icon, className, children, ref, ...props }) {
  return (
    <span ref={ref} className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {Icon && <Icon aria-hidden="true" className={cn('shrink-0', iconSize[size])} />}
      {children}
    </span>
  )
}
