import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'

const SUFFIX = 'Mavuus'

// Order matters — more-specific patterns first
const routes = [
  { pattern: '/home', title: 'Home' },
  { pattern: '/about', title: 'About' },
  { pattern: '/pricing', title: 'Pricing' },
  { pattern: '/contact', title: 'Contact' },
  { pattern: '/resources', title: 'Resources' },
  { pattern: '/articles/:id', title: 'Article' },
  { pattern: '/articles', title: 'Articles' },
  { pattern: '/events/:id/confirmation', title: 'Registration Confirmed' },
  { pattern: '/events', title: 'Events' },
  { pattern: '/blog/:id', title: 'Article' },
  { pattern: '/login', title: 'Sign In' },
  { pattern: '/register', title: 'Create Account' },
  { pattern: '/dashboard/live-sessions/:id', title: 'Live Session' },
  { pattern: '/dashboard/live-sessions', title: 'Live Sessions' },
  { pattern: '/dashboard/on-demand/:id', title: 'On-Demand Session' },
  { pattern: '/dashboard/on-demand', title: 'On-Demand Videos' },
  { pattern: '/dashboard/resources/:id', title: 'Resource' },
  { pattern: '/dashboard/resources', title: 'Community Resources' },
  { pattern: '/dashboard/members/:id', title: 'Member Profile' },
  { pattern: '/dashboard/members', title: 'Members' },
  { pattern: '/dashboard/vendors/:id', title: 'Vendor' },
  { pattern: '/dashboard/vendors', title: 'Vendors' },
  { pattern: '/dashboard/jobs/:id', title: 'Job Details' },
  { pattern: '/dashboard/jobs', title: 'Jobs' },
  { pattern: '/dashboard/my-jobs', title: 'My Jobs' },
  { pattern: '/dashboard/profile', title: 'My Profile' },
  { pattern: '/dashboard/messages', title: 'Messages' },
  { pattern: '/dashboard', title: 'Dashboard' },
]

export default function RouteTitles() {
  const location = useLocation()
  useEffect(() => {
    const match = routes.find((r) => matchPath(r.pattern, location.pathname))
    document.title = match ? `${match.title} · ${SUFFIX}` : SUFFIX
  }, [location.pathname])
  return null
}
