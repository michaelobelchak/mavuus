import { useIsShellMounted } from './shellPresence'

/**
 * "Skip to main content" for pages outside the app shell (public site, auth pages and any 404,
 * including one under /dashboard or /admin). Hidden while a shell is mounted, since AppShell
 * renders its own.
 */
export function SiteSkipLink() {
  if (useIsShellMounted()) return null
  return (
    <a href="#main-content" className="skip-to-main">
      Skip to main content
    </a>
  )
}
