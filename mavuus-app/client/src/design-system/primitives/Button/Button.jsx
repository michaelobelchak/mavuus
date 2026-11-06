import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { controlIconSizes, resolveControlSize } from '../../lib/controlSizes'
import { ExternalHint } from '../../lib/ExternalHint'
import { linkProps } from '../../lib/linkProps'
import { buttonVariants } from './buttonVariants'

function suppress(event) {
  event.preventDefault()
}

/**
 * Button. Renders a react-router Link when given `to`, an anchor when given `href`,
 * and a `<button type="button">` otherwise.
 *
 * `loading` keeps the button focusable: it sets aria-disabled and aria-busy, announces
 * "Loading", and swallows clicks (and form submits). `disabled` sets native disabled on a
 * <button> and aria-disabled on a link.
 */
export function Button({
  variant,
  size,
  block,
  loading = false,
  disabled = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  to,
  href,
  target,
  rel,
  type = 'button',
  onClick,
  className,
  children,
  ref,
  ...props
}) {
  const resolvedSize = resolveControlSize(size)
  const iconClass = cn('shrink-0', controlIconSizes[resolvedSize])
  const classes = cn(buttonVariants({ variant, size: resolvedSize, block }), className)

  const leading = loading ? (
    <>
      <Loader2 aria-hidden="true" className={cn(iconClass, 'animate-spin motion-reduce:animate-none')} />
      <span className="sr-only">Loading</span>{' '}
    </>
  ) : (
    LeadingIcon && <LeadingIcon aria-hidden="true" className={iconClass} />
  )
  const trailing = TrailingIcon && <TrailingIcon aria-hidden="true" className={iconClass} />

  if (to !== undefined || href !== undefined) {
    const link = linkProps({ to, href, target, rel, onClick, inactive: loading || disabled })
    const { Component } = link
    return (
      <Component ref={ref} className={classes} aria-busy={loading || undefined} {...link.props} {...props}>
        {leading}
        {children}
        {trailing}
        {link.opensNewTab && <ExternalHint />}
      </Component>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? suppress : onClick}
      className={classes}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
