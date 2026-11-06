import { Badge } from '../../../primitives'
import { resolveStatus } from './statusBadges'

/**
 * Badge for a record's status string ("pending", "in-progress", "banned"). The tone and label come
 * from STATUS_BADGES, so every admin list shows the same status the same way. Unknown statuses
 * render neutral and warn once in dev. `label` overrides the text; `size` and other props go to
 * the Badge.
 */
export function StatusBadge({ status, label, ...props }) {
  const resolved = resolveStatus(status)
  return (
    <Badge tone={resolved.tone} {...props}>
      {label ?? resolved.label}
    </Badge>
  )
}
