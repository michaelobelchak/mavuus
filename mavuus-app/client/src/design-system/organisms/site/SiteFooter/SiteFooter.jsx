import { Link as RouterLink } from 'react-router-dom'
import { MAVUUS_LOGO_URL } from '../../../lib/brand'
import { cn } from '../../../lib/cn'
import { SITE_FOOTER_COLUMNS } from '../siteLinks'

const columnTitle = 'm-ds-none mb-ds-sm text-lead leading-7 font-medium'
// 44px tall rows (24px line plus 10px above and below on the live site).
const columnLink =
  'flex min-h-11 items-center text-body leading-6 font-medium text-text-secondary transition-colors motion-reduce:transition-none hover:text-text-brand'
const legalLink = 'inline-flex min-h-11 items-center hover:text-text-brand'

/**
 * The public site footer: logo and tagline, link columns, a "Get in Touch" column and the legal
 * row. `columns` replaces the link columns (`[{ title, links: [{ label, to }] }]`).
 * `className` and other props go to the `<footer>`.
 */
export function SiteFooter({ columns = SITE_FOOTER_COLUMNS, className, ref, ...props }) {
  return (
    <footer ref={ref} className={cn('border-t border-border-subtle text-text-primary', className)} {...props}>
      <div className="px-ds-gutter max-md:px-ds-gutter-sm">
        <div className="mx-auto max-w-7xl pt-ds-section pb-ds-section-xs max-site-md:pt-ds-section-md max-md:pt-ds-section-sm">
          <div className="flex gap-y-ds-md pb-ds-xxxl max-site-md:flex-col max-site-md:gap-y-ds-xxl max-md:pb-ds-xxl">
            <div className="flex min-w-0 grow flex-col items-start gap-ds-md">
              <RouterLink to="/" aria-label="Mavuus home" className="block w-fit">
                <img
                  src={MAVUUS_LOGO_URL}
                  alt="Mavuus"
                  width="175"
                  height="34"
                  loading="lazy"
                  className="block h-8.5 w-43.75"
                />
              </RouterLink>
              <p className="m-ds-none max-w-75 text-body leading-7 text-text-secondary">
                Marketing strategy, execution and leadership for B2B growth.
              </p>
            </div>
            <div className="grid w-192 shrink-0 grid-cols-3 gap-y-ds-md max-site-lg:w-160 max-site-md:w-full max-md:gap-x-ds-lg max-site-sm:grid-cols-1 max-site-sm:gap-y-ds-section-xs">
              {columns.map((column) => (
                <div key={column.title} className="flex flex-col items-start">
                  <h2 className={columnTitle}>{column.title}</h2>
                  {column.links.map((link) => (
                    <RouterLink key={link.label} to={link.to} className={columnLink}>
                      {link.label}
                    </RouterLink>
                  ))}
                </div>
              ))}
              <div className="flex flex-col items-start">
                <h2 className={columnTitle}>Get in Touch</h2>
                {/* py-2.5 (10px, no token) lines this text up with the first link row next to it; a
                    min-height would drop the top offset and lift the text 10px. */}
                <p className="m-ds-none py-2.5 text-body leading-7 text-text-primary">
                  Question or feedback? We would love to{' '}
                  <RouterLink
                    to="/contact"
                    className="text-text-secondary underline transition-colors motion-reduce:transition-none hover:text-text-brand"
                  >
                    hear from you
                  </RouterLink>
                  .
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-ds-md border-t border-border-divider/60 pt-ds-xl text-body-sm leading-6 text-text-secondary">
            <span>&copy; {new Date().getFullYear()} Mavuus. All rights reserved.</span>
            <span className="flex gap-ds-lg">
              <RouterLink to="/terms-conditions/introduction" className={legalLink}>
                Terms
              </RouterLink>
              <RouterLink to="/privacy-policy/introduction" className={legalLink}>
                Privacy
              </RouterLink>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
