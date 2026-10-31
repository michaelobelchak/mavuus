import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'

const SUFFIX = 'Mavuus'

// Order matters — more-specific patterns first
const routes = [
  // Public pages use the live mavuus.com titles verbatim (full: true skips the suffix)
  { pattern: '/', title: 'Mavuus | B2B Marketing Strategy, Execution & Leadership', full: true },
  { pattern: '/membership', title: 'Pricing | Free 30-Day Trial - Mavuus', full: true },
  { pattern: '/marketing-services', title: 'Marketing Services | Mavuus', full: true },
  { pattern: '/resources', title: 'Resources | Events, Articles, On-Demand Videos - Mavuus', full: true },
  { pattern: '/about', title: 'About Us - Mavuus', full: true },
  { pattern: '/contact', title: 'Contact Us - Mavuus', full: true },
  { pattern: '/faq', title: 'FAQs - Mavuus', full: true },
  { pattern: '/faq/:category', title: 'FAQs - Mavuus', full: true },
  { pattern: '/terms-conditions/:section', title: 'Terms & Conditions - Mavuus', full: true },
  { pattern: '/privacy-policy/:section', title: 'Privacy Policy - Mavuus', full: true },
  // These pages set their own title from their content
  { pattern: '/post/:slug', skip: true },
  { pattern: '/demands-videos/:slug', skip: true },
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
    if (match?.skip) return
    if (match?.full) document.title = match.title
    else document.title = match ? `${match.title} · ${SUFFIX}` : SUFFIX
  }, [location.pathname])
  return null
}
