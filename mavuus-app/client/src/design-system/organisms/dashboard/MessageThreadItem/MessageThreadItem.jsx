import { cn } from '../../../lib/cn'
import { linkProps } from '../../../lib/linkProps'
import { Avatar, Caption, Skeleton } from '../../../primitives'

const shortCount = (count) => (count > 99 ? '99+' : String(count))

const rowClass = [
  'relative flex w-full cursor-pointer items-center gap-ds-sm px-ds-md py-ds-sm text-left',
  'transition-colors duration-150 hover:bg-surface-hover motion-reduce:transition-none',
]

/**
 * One conversation in the MessagesPage thread list.
 * - `name` (required), `avatarSrc` (initials when missing), `preview` (the last message, one line;
 *   "No messages yet" when empty), `fromSelf` (prefixes "You: "), `time` (preformatted, "10:42 AM").
 * - `unreadCount`: a count bubble, read as "3 unread messages", and a bold name and preview.
 * - `selected`: the open thread. Selected surface, a brand bar on the left and aria-current.
 * - `onSelect` renders a button; `to` / `href` render a link (lib/linkProps).
 * Put it in an `<li>` of the list. `ref`, `className` and other props go to the button or link.
 */
export function MessageThreadItem({
  name,
  avatarSrc,
  preview,
  fromSelf = false,
  time,
  unreadCount = 0,
  selected = false,
  onSelect,
  to,
  href,
  className,
  ref,
  ...props
}) {
  const unread = unreadCount > 0
  const content = (
    <>
      {selected && <span aria-hidden="true" className="absolute inset-y-ds-xs left-ds-none w-1 rounded-chip bg-surface-brand" />}
      <Avatar name={name} src={avatarSrc} size="md" />
      <span className="flex min-w-0 grow flex-col gap-ds-none">
        <span className="flex items-baseline justify-between gap-ds-xs">
          <span className={cn('truncate text-body-sm text-text-primary', unread ? 'font-bold' : 'font-semibold')}>{name}</span>
          {time && <Caption className="shrink-0">{time}</Caption>}
        </span>
        <span className="flex items-center justify-between gap-ds-xs">
          <span className={cn('truncate text-body-sm', unread ? 'font-semibold text-text-primary' : 'text-text-muted')}>
            {preview ? `${fromSelf ? 'You: ' : ''}${preview}` : 'No messages yet'}
          </span>
          {unread && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-chip bg-surface-brand-strong px-ds-xxs text-caption font-semibold text-text-on-brand">
              <span aria-hidden="true">{shortCount(unreadCount)}</span>
              <span className="sr-only">{`, ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`}</span>
            </span>
          )}
        </span>
      </span>
    </>
  )
  const classes = cn(rowClass, selected && 'bg-surface-selected hover:bg-surface-selected', className)
  const current = selected ? 'true' : undefined

  if (to !== undefined || href !== undefined) {
    const link = linkProps({ to, href })
    const { Component } = link
    return (
      <Component ref={ref} aria-current={current} className={classes} {...link.props} {...props}>
        {content}
      </Component>
    )
  }
  return (
    <button ref={ref} type="button" aria-current={current} onClick={onSelect} className={classes} {...props}>
      {content}
    </button>
  )
}

/** Loading placeholder row with the MessageThreadItem layout. */
export function MessageThreadItemSkeleton({ className, ...props }) {
  return (
    <div aria-busy="true" className={cn('flex items-center gap-ds-sm px-ds-md py-ds-sm', className)} {...props}>
      <Skeleton shape="circle" />
      <div className="flex grow flex-col gap-ds-xs">
        <Skeleton className="w-1/3" />
        <Skeleton className="w-3/4" />
      </div>
      <span className="sr-only">Loading conversation</span>
    </div>
  )
}
