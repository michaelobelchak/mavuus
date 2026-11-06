import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useMediaQuery } from '../../../hooks'
import { MAVUUS_LOGO_URL } from '../../../lib/brand'
import { cn } from '../../../lib/cn'
import { Button, IconButton } from '../../../primitives'
import { SITE_NAV_LINKS } from '../siteLinks'

const MENU_ID = 'site-mobile-menu'

const linkBase =
  'block whitespace-nowrap rounded-control px-ds-md py-ds-sm text-body leading-6 font-medium transition-colors motion-reduce:transition-none hover:text-text-brand'
const navLinkClass = ({ isActive }) => cn(linkBase, isActive ? 'text-text-brand' : 'text-text-ink')

// The public CTA look on Button: 56px tall, 16px radius, the blue drop shadow.
const signUpClass = 'rounded-card leading-6 shadow-button-secondary'

// The menu icon is drawn a little bolder than lucide's default, as on the live site.
function MenuIcon(props) {
  return <Menu strokeWidth={2.25} {...props} />
}

/**
 * The public site header: logo, the main pages, Login and Sign Up. Sticky, on a translucent
 * blurred surface. Below 1200px the links move into a menu under the menu button: it opens with
 * focus on its first link and closes on Escape (focus back on the button), a click outside,
 * navigation or the window growing to 1200px. The current page's link is pink (`aria-current="page"`).
 * `links` replaces the page links (`[{ label, to }]`); `className` and other props go to the `<header>`.
 */
export function SiteHeader({ links = SITE_NAV_LINKS, className, ref, ...props }) {
  const { pathname } = useLocation()
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openFor, setOpenFor] = useState(null)
  // At 1200px and up the menu is hidden, so growing past it closes the menu for good.
  const wide = useMediaQuery('(min-width: 75rem)')
  const [wasWide, setWasWide] = useState(wide)
  if (wasWide !== wide) {
    setWasWide(wide)
    if (wide) setOpenFor(null)
  }
  const menuOpen = !wide && openFor === pathname
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    menuRef.current?.querySelector('a')?.focus()
    const close = (returnFocus) => {
      setOpenFor(null)
      if (returnFocus) toggleRef.current?.focus()
    }
    const onKey = (event) => {
      if (event.key === 'Escape') close(true)
    }
    const onPointer = (event) => {
      if (!menuRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  return (
    <header
      ref={ref}
      className={cn(
        'sticky top-0 z-(--ds-z-sticky) border-b border-transparent bg-surface-header/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface-header/85',
        className,
      )}
      {...props}
    >
      <div className="flex min-h-28 items-center py-ds-md max-md:min-h-20">
        <div className="w-full px-ds-gutter max-md:px-ds-gutter-sm">
          <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-ds-lg">
            <RouterLink to="/" aria-label="Mavuus home" className="shrink-0">
              <img
                src={MAVUUS_LOGO_URL}
                alt="Mavuus"
                width="186"
                height="48"
                className="h-12 w-46.5 max-md:h-10 max-md:w-38.75"
              />
            </RouterLink>

            <nav className="flex gap-ds-xxs max-site-lg:hidden" aria-label="Main">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-ds-xs max-site-lg:hidden">
              <RouterLink to="/login" className={cn(linkBase, 'text-text-ink')}>
                Login
              </RouterLink>
              <Button to="/register" variant="secondary" size="lg" className={signUpClass}>
                Sign Up
              </Button>
            </div>

            <IconButton
              ref={toggleRef}
              icon={menuOpen ? X : MenuIcon}
              variant="ghost"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setOpenFor(menuOpen ? null : pathname)}
              className="hidden max-site-lg:inline-flex [&>svg]:size-7"
            />

            {menuOpen && (
              <nav
                id={MENU_ID}
                ref={menuRef}
                aria-label="Main"
                className="absolute top-full right-0 z-(--ds-z-dropdown) mt-ds-sm flex w-80 animate-[ds-fade-in_var(--ds-duration-emphasized)_var(--ds-easing-out)] flex-col rounded-card border border-border-default bg-surface-raised p-ds-xs shadow-float motion-reduce:animate-none max-site-sm:w-full site-lg:hidden"
              >
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                ))}
                <RouterLink to="/login" className={cn(linkBase, 'text-text-ink')}>
                  Login
                </RouterLink>
                <div className="p-ds-xs pt-ds-sm">
                  <Button to="/register" variant="secondary" size="lg" block className={signUpClass}>
                    Sign Up
                  </Button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
