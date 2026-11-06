import { AlertBase } from './Alert'

/**
 * Full-width page or app banner (maintenance notices, announcements). Same props and roles as Alert.
 * Place it above the page content, not inside cards.
 */
export function Banner(props) {
  return <AlertBase layout="banner" component="Banner" {...props} />
}
