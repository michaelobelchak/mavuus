import { Link as RouterLink } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { buttonVariants } from './buttonVariants'

/**
 * Button. Renders a react-router Link when given `to`, an anchor when given `href`,
 * and a `<button type="button">` otherwise.
 */
export function Button({
  variant,
  size,
  block,
  loading = false,
  disabled,
  to,
  href,
  type = 'button',
  className,
  children,
  ref,
  ...props
}) {
  const classes = cn(buttonVariants({ variant, size, block }), className)
  const content = (
    <>
      {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {children}
    </>
  )

  if (to !== undefined || href !== undefined) {
    const inactive = loading || disabled
    const linkProps = {
      ref,
      className: classes,
      'aria-busy': loading || undefined,
      'aria-disabled': inactive || undefined,
      tabIndex: inactive ? -1 : undefined,
      ...props,
    }
    if (to !== undefined) {
      return (
        <RouterLink to={to} {...linkProps}>
          {content}
        </RouterLink>
      )
    }
    return (
      <a href={href} {...linkProps}>
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </button>
  )
}
