import { cn } from '../../lib/cn'
import { ExternalHint } from '../../lib/ExternalHint'
import { linkProps } from '../../lib/linkProps'
import { linkVariants } from './linkVariants'

/**
 * Text link. `to` renders a react-router Link; `href` renders an anchor. Absolute http(s)
 * hrefs open in a new tab with rel="noopener noreferrer" and say so to screen readers.
 * A `target` or `rel` you pass wins; the hint only shows when the link opens a new tab.
 */
export function Link({ variant, to, href, target, rel, onClick, className, children, ref, ...props }) {
  const link = linkProps({ to, href, target, rel, onClick })
  const { Component } = link
  return (
    <Component ref={ref} className={cn(linkVariants({ variant }), className)} {...link.props} {...props}>
      {children}
      {link.opensNewTab && <ExternalHint />}
    </Component>
  )
}
