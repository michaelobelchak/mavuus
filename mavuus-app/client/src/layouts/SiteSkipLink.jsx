import { useLocation } from 'react-router-dom'

// The member area and the admin panel render AppShell, which has its own skip link.
const SHELL_PATH = /^\/(dashboard|admin)(\/|$)/

/** "Skip to main content" for pages outside the app shell (public site, auth pages, 404). */
export function SiteSkipLink() {
  const { pathname } = useLocation()
  if (SHELL_PATH.test(pathname)) return null
  return (
    <a href="#main-content" className="skip-to-main">
      Skip to main content
    </a>
  )
}
