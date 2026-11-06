import { Link as RouterLink } from 'react-router-dom'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const linkVariants = cva(
  'text-text-link underline-offset-4 decoration-1 transition-colors duration-150 ease-enter hover:text-text-primary motion-reduce:transition-none',
  {
    variants: {
      variant: {
        inline: 'underline',
        standalone: 'no-underline hover:underline font-semibold',
      },
    },
    defaultVariants: { variant: 'inline' },
  },
)

const EXTERNAL = /^https?:\/\//i

/**
 * Text link. `to` renders a react-router Link; `href` renders an anchor. Absolute http(s)
 * hrefs open in a new tab with rel="noopener noreferrer" and announce that to screen readers.
 */
export function Link({ variant, to, href, className, children, ref, ...props }) {
  const classes = cn(linkVariants({ variant }), className)

  if (to !== undefined) {
    return (
      <RouterLink ref={ref} to={to} className={classes} {...props}>
        {children}
      </RouterLink>
    )
  }

  const external = typeof href === 'string' && EXTERNAL.test(href)
  return (
    <a
      ref={ref}
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
      {external && (
        <>
          {' '}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  )
}
