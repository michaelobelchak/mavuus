import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const chipVariants = cva(
  [
    'inline-flex items-center justify-center gap-ds-xxs rounded-chip border font-semibold whitespace-nowrap',
    'transition-[background-color,color,border-color] duration-150 ease-enter motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:opacity-60',
  ],
  {
    variants: {
      selected: {
        true: 'bg-surface-selected border-border-brand text-text-brand-strong',
        false:
          'bg-surface-raised border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary',
      },
      size: {
        sm: 'h-9 px-ds-sm text-body-sm',
        md: 'h-11 px-ds-md text-body',
      },
    },
    defaultVariants: { selected: false, size: 'md' },
  },
)

/**
 * Selectable pill. Controlled: pass `selected` and toggle it in `onClick`.
 * `aria-pressed` is set only when `selected` is given, so a plain chip is a normal button.
 */
export function Chip({ selected, size, icon: Icon, type = 'button', className, children, ref, ...props }) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected === undefined ? undefined : Boolean(selected)}
      className={cn(chipVariants({ selected: Boolean(selected), size }), className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
      {children}
    </button>
  )
}
