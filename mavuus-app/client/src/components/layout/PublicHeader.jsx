import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export const LIVE_LOGO = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/6689763240456e66e970e5aa_logo.svg'

const NAV_LINKS = [
  { label: 'Membership', to: '/membership' },
  { label: 'Services', to: '/marketing-services' },
  { label: 'Resources', to: '/resources' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

const linkClass = 'block p-4 text-base font-medium leading-6 text-live-ink transition-colors hover:text-brand-pink'

export default function PublicHeader() {
  const { pathname } = useLocation()
  const [openFor, setOpenFor] = useState(null)
  const menuOpen = openFor === pathname

  return (
    <header className="sticky top-0 z-50 bg-[#fafbfc]">
      <div className="flex min-h-28 items-center justify-center bg-white/[0.02] py-4">
        <div className="w-full px-10 max-md:px-5">
          <div className="relative mx-auto flex max-w-[1280px] items-center justify-between">
            <Link to="/" aria-label="Mavuus home" className="shrink-0">
              <img src={LIVE_LOGO} alt="Mavuus" className="h-12 w-[186px]" />
            </Link>

            <nav className="flex gap-4 max-lg:hidden" aria-label="Main">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
              ))}
            </nav>

            <div className="flex items-center max-lg:hidden">
              <Link to="/login" className={linkClass}>Login</Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-blue px-8 py-4 text-base font-bold leading-6 text-white shadow-[0_25px_20px_-20px_#1f648d] transition-colors hover:bg-brand-blue-hover"
              >
                Sign Up
              </Link>
            </div>

            <button
              type="button"
              className="hidden p-2 text-black max-lg:block"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setOpenFor(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X size={32} /> : <Menu size={32} strokeWidth={2.5} />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[4.6rem] z-[9999] w-80 rounded-[10px] bg-white/95 py-2 shadow-[0_2px_5px_rgba(0,0,0,0.2)] backdrop-blur-[20px] max-[479px]:w-full lg:hidden">
                {NAV_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} className={`${linkClass} pl-[1.5625rem]`}>{l.label}</NavLink>
                ))}
                <Link to="/login" className={`${linkClass} pl-[1.5625rem]`}>Login</Link>
                <div className="px-[1.5625rem] py-3">
                  <Link to="/register" className="flex w-full items-center justify-center rounded-2xl bg-brand-blue px-8 py-4 text-base font-bold text-white">
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
