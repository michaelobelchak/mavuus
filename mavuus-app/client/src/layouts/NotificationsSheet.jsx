import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Bell, Briefcase, CheckCircle, MessageCircle, Radio, Star, UserPlus } from 'lucide-react'
import { cn } from '@/design-system/lib/cn'
import { Alert, EmptyState, Sheet } from '@/design-system/patterns'
import { Button, Caption, Chip, Skeleton, Text } from '@/design-system/primitives'
import { timeAgo } from './timeAgo'

const TYPE_STYLES = {
  connection: { icon: UserPlus, tile: 'bg-status-info-subtle text-status-info' },
  message: { icon: MessageCircle, tile: 'bg-surface-selected text-text-brand-strong' },
  job: { icon: Briefcase, tile: 'bg-status-success-subtle text-status-success' },
  session: { icon: Radio, tile: 'bg-surface-selected text-text-brand-strong' },
  system: { icon: CheckCircle, tile: 'bg-surface-sunken text-text-secondary' },
  review: { icon: Star, tile: 'bg-status-warning-subtle text-status-warning' },
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

function NotificationRow({ notification, onPick }) {
  const { icon: Icon, tile } = TYPE_STYLES[notification.type] ?? TYPE_STYLES.system
  const unread = !notification.is_read
  const body = (
    <>
      <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-chip', tile)}>
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 grow flex-col gap-ds-xxs">
        <Text as="span" size="body-sm" className={cn('m-ds-none', unread ? 'font-semibold' : 'font-medium')}>
          {notification.title}
        </Text>
        {notification.message && (
          <Text as="span" size="body-sm" tone="secondary" className="m-ds-none line-clamp-2">
            {notification.message}
          </Text>
        )}
        <Caption tone="muted">{timeAgo(notification.created_at)}</Caption>
      </span>
      {unread && (
        <span className="flex shrink-0 items-center pt-ds-xs">
          <span aria-hidden="true" className="size-2 rounded-chip bg-surface-brand" />
          <span className="sr-only">Unread</span>
        </span>
      )}
    </>
  )
  const rowClass = cn(
    'flex w-full items-start gap-ds-sm rounded-control p-ds-sm text-left text-text-primary no-underline transition-colors duration-150 ease-enter hover:bg-surface-hover motion-reduce:transition-none',
    unread && 'bg-surface-sunken',
  )
  return (
    <li>
      {notification.link ? (
        <RouterLink to={notification.link} onClick={() => onPick(notification)} className={rowClass}>
          {body}
        </RouterLink>
      ) : (
        <button type="button" onClick={() => onPick(notification)} className={rowClass}>
          {body}
        </button>
      )}
    </li>
  )
}

function LoadingRows() {
  return (
    <ul className="m-ds-none flex list-none flex-col gap-ds-xs p-ds-none">
      {[0, 1, 2].map((key) => (
        <li key={key} className="flex items-start gap-ds-sm p-ds-sm">
          <Skeleton shape="circle" className="size-10 shrink-0" />
          <Skeleton lines={2} className="grow" />
        </li>
      ))}
    </ul>
  )
}

/**
 * The notifications drawer: a right Sheet, so it is unmounted (and nothing in it can take focus)
 * while closed. Lists `items` from /api/notifications with All and Unread filters.
 * - `open` / `onOpenChange`, `id` (the bell's aria-controls), `finalFocus` (where focus goes on close),
 *   `onFollowLink(notification)` (a picked item with a link is about to navigate).
 * - `unreadCount`, `onMarkRead(id)` (a picked unread item), `onMarkAllRead()`.
 * - `loading`, `error`, `onRetry` for the list states.
 * Picking an item marks it read, closes the sheet and follows its link.
 */
export function NotificationsSheet({
  id,
  open,
  onOpenChange,
  items = [],
  unreadCount = 0,
  loading = false,
  error,
  onRetry,
  onMarkRead,
  onMarkAllRead,
  finalFocus,
  onFollowLink,
}) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'unread' ? items.filter((item) => !item.is_read) : items
  // Both chips count the loaded list, so a chip never promises rows it can't show. The server
  // sends the newest 50 notifications at most; the description keeps the overall unread total.
  const counts = { all: items.length, unread: items.filter((item) => !item.is_read).length }

  function pick(notification) {
    if (!notification.is_read) onMarkRead?.(notification.id)
    if (notification.link) onFollowLink?.(notification)
    onOpenChange?.(false)
  }

  let content
  if (error) {
    content = (
      <Alert
        tone="error"
        title="Couldn't load your notifications"
        description="Check your connection and try again."
        actions={
          onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )
        }
      />
    )
  } else if (loading && items.length === 0) {
    content = <LoadingRows />
  } else if (visible.length === 0) {
    content =
      filter === 'unread' ? (
        <EmptyState size="sm" icon={Bell} title="All caught up" description="You have no unread notifications." />
      ) : (
        <EmptyState size="sm" icon={Bell} title="No notifications yet" description="We'll let you know when something happens." />
      )
  } else {
    content = (
      <ul className="m-ds-none flex list-none flex-col gap-ds-xxs p-ds-none">
        {visible.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} onPick={pick} />
        ))}
      </ul>
    )
  }

  return (
    <Sheet
      id={id}
      side="right"
      size="md"
      open={open}
      onOpenChange={onOpenChange}
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
      finalFocus={finalFocus}
      aria-busy={loading ? 'true' : undefined}
    >
      <div className="flex h-full min-h-0 flex-col gap-ds-md">
        <div className="flex flex-wrap items-center justify-between gap-ds-xs">
          <div className="flex gap-ds-xs" role="group" aria-label="Show">
            {FILTERS.map(({ value, label }) => (
              <Chip key={value} size="xs" selected={filter === value} onClick={() => setFilter(value)}>
                {label}
                <span className="text-text-muted">{counts[value]}</span>
              </Chip>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="-mx-ds-sm min-h-0 grow overflow-y-auto px-ds-xxs">{content}</div>
      </div>
    </Sheet>
  )
}
