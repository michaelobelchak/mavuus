import { AlertBase } from './Alert'

/**
 * Full-width page or app banner (maintenance notices, announcements). Same props as Alert, but always
 * role="status": a banner is page furniture that is usually there on load, so it never interrupts.
 * Use an inline Alert for warnings and errors that need attention right away. Place it above the page
 * content, not inside cards.
 */
export function Banner(props) {
  return <AlertBase role="status" layout="banner" component="Banner" {...props} />
}
