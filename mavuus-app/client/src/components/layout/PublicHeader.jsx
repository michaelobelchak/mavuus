import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Resources', path: '/resources' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Contact', path: '/contact' },
]

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-[29px] h-[31px]" />
          <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-[20px]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-brand-pink'
                  : 'text-neutral-600 hover:text-dark-blue'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Join Now</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-dark-blue cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium ${
                  location.pathname === link.path ? 'text-brand-pink' : 'text-neutral-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm">Join Now</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
