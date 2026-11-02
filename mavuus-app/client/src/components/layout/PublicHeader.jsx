import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import LiveButton from '../live/LiveButton'

export const LIVE_LOGO = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/6689763240456e66e970e5aa_logo.svg'

const NAV_LINKS = [
  { label: 'Membership', to: '/membership' },
  { label: 'Services', to: '/marketing-services' },
  { label: 'Resources', to: '/resources' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

const MENU_ID = 'public-mobile-menu'
const linkBase = 'block whitespace-nowrap rounded-xl px-4 py-3 text-base font-medium leading-6 transition-colors hover:text-brand-pink'
const navLinkClass = ({ isActive }) => `${linkBase} ${isActive ? 'text-brand-pink' : 'text-live-ink'}`

export default function PublicHeader() {
  const { pathname } = useLocation()
  const [openFor, setOpenFor] = useState(null)
  const menuOpen = openFor === pathname
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    menuRef.current?.querySelector('a')?.focus()
    const close = (returnFocus) => {
      setOpenFor(null)
      if (returnFocus) toggleRef.current?.focus()
    }
    const onKey = (e) => { if (e.key === 'Escape') close(true) }
    const onPointer = (e) => {
      if (!menuRef.current?.contains(e.target) && !toggleRef.current?.contains(e.target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-[#fafbfc]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#fafbfc]/85">
      <div className="flex min-h-28 items-center py-4 max-[767px]:min-h-20">
        <div className="w-full px-10 max-md:px-5">
          <div className="relative mx-auto flex max-w-[1280px] items-center justify-between gap-6">
            <Link to="/" aria-label="Mavuus home" className="shrink-0">
              <img src={LIVE_LOGO} alt="Mavuus" width="186" height="48" className="h-12 w-[186px] max-[767px]:h-10 max-[767px]:w-[155px]" />
            </Link>

            <nav className="flex gap-1 max-[1199px]:hidden" aria-label="Main">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={navLinkClass}>{l.label}</NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 max-[1199px]:hidden">
              <Link to="/login" className={`${linkBase} text-live-ink`}>Login</Link>
              <LiveButton to="/register" variant="blue" fullOnMobile={false} className="whitespace-nowrap">Sign Up</LiveButton>
            </div>

            <button
              ref={toggleRef}
              type="button"
              className="hidden size-12 cursor-pointer items-center justify-center rounded-xl text-dark-blue transition-colors hover:bg-black/5 max-[1199px]:flex"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setOpenFor(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} strokeWidth={2.25} />}
            </button>

            {menuOpen && (
              <nav
                id={MENU_ID}
                ref={menuRef}
                aria-label="Main"
                className="absolute right-0 top-[calc(100%+12px)] z-[9999] flex w-80 animate-[fadeIn_0.25s_var(--ease-live)] flex-col rounded-2xl border border-live-hairline bg-white p-2 shadow-[var(--shadow-live-float)] motion-reduce:animate-none max-[479px]:w-full min-[1200px]:hidden"
              >
                {NAV_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} className={navLinkClass}>{l.label}</NavLink>
                ))}
                <Link to="/login" className={`${linkBase} text-live-ink`}>Login</Link>
                <div className="p-2 pt-3">
                  <LiveButton to="/register" variant="blue" className="w-full">Sign Up</LiveButton>
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
