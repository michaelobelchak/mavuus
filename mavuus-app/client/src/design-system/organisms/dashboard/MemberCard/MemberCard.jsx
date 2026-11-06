import { Clock, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel, resolveOption } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink } from '../../../patterns'
import { Avatar, Badge, Button, Heading, Skeleton, Text } from '../../../primitives'

const CONNECTIONS = ['none', 'outgoing', 'incoming', 'connected']

function ConnectionAction({ connection, name, onConnect, onAccept, connecting, messageTo }) {
  if (connection === 'connected') {
    return messageTo ? (
      <Button variant="outline" size="sm" block leadingIcon={MessageCircle} to={messageTo} aria-label={`Message ${name}`}>
        Message
      </Button>
    ) : (
      <Button variant="outline" size="sm" block leadingIcon={UserCheck} disabled>
        Connected
      </Button>
    )
  }
  if (connection === 'outgoing') {
    return (
      <Button variant="outline" size="sm" block leadingIcon={Clock} disabled>
        Request sent
      </Button>
    )
  }
  if (connection === 'incoming') {
    if (!onAccept) return null
    return (
      <Button size="sm" block leadingIcon={UserPlus} onClick={onAccept} aria-label={`Accept request from ${name}`}>
        Accept request
      </Button>
    )
  }
  if (!onConnect) return null
  return (
    <Button
      variant="outline"
      size="sm"
      block
      leadingIcon={UserPlus}
      loading={connecting}
      onClick={onConnect}
      aria-label={`Connect with ${name}`}
    >
      Connect
    </Button>
  )
}

/**
 * A member in the directory grid (MembersPage) and member lists on profiles.
 * - `name` (required), `title`, `company`, `avatarSrc` (initials when missing), `tier` ("Pro"
 *   shows a "Pro member" badge).
 * - `connection`: none (default), outgoing (request sent), incoming (they asked you) or connected.
 *   `onConnect`, `onAccept`, `connecting` (busy Connect button) and `messageTo` (the Message link
 *   once connected) drive the action at the bottom. `isSelf` hides it. A Pending or Connected
 *   badge shows next to the tier.
 * - `to` / `href`: the name is the card's stretched link; the action sits above it.
 * - `headingLevel` (default 3), `as` (default article). Other props go to the Card.
 */
export function MemberCard({
  name,
  title,
  company,
  avatarSrc,
  tier,
  connection,
  onConnect,
  onAccept,
  connecting = false,
  messageTo,
  isSelf = false,
  to,
  href,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'MemberCard')
  const resolvedConnection = resolveOption(connection, CONNECTIONS, 'none', 'MemberCard', 'connection')
  const linked = to !== undefined || href !== undefined
  const action = !isSelf && (
    <ConnectionAction
      connection={resolvedConnection}
      name={name}
      onConnect={onConnect}
      onAccept={onAccept}
      connecting={connecting}
      messageTo={messageTo}
    />
  )
  const pending = resolvedConnection === 'outgoing' || resolvedConnection === 'incoming'

  return (
    <Card
      as={as}
      interactive={linked}
      className={cn('flex h-full flex-col items-center gap-ds-md text-center', className)}
      {...props}
    >
      <Avatar name={name} src={avatarSrc} size="lg" />
      <div className="flex w-full min-w-0 flex-col gap-ds-xxs">
        <Heading level={level} size="h4" className="truncate">
          {linked ? (
            <CardLink to={to} href={href}>
              {name}
            </CardLink>
          ) : (
            name
          )}
        </Heading>
        {title && (
          <Text size="body-sm" tone="secondary" className="line-clamp-2">
            {title}
          </Text>
        )}
        {company && (
          <Text size="body-sm" tone="brand" className="truncate font-semibold">
            {company}
          </Text>
        )}
      </div>
      {(tier || pending || resolvedConnection === 'connected') && (
        <div className="flex flex-wrap items-center justify-center gap-ds-xs">
          {tier && (
            <Badge size="sm" tone="brand">
              {`${tier} member`}
            </Badge>
          )}
          {pending && (
            <Badge size="sm" tone="warning" leadingIcon={Clock}>
              Pending
            </Badge>
          )}
          {resolvedConnection === 'connected' && (
            <Badge size="sm" tone="success" leadingIcon={UserCheck}>
              Connected
            </Badge>
          )}
        </div>
      )}
      {action && <CardAction className="mt-auto w-full">{action}</CardAction>}
    </Card>
  )
}

/** Loading placeholder with the MemberCard layout. */
export function MemberCardSkeleton({ className, ...props }) {
  return (
    <Card aria-busy="true" className={cn('flex h-full flex-col items-center gap-ds-md', className)} {...props}>
      <Skeleton shape="circle" className="size-14" />
      <div className="flex w-full flex-col items-center gap-ds-xs">
        <Skeleton className="w-1/2" />
        <Skeleton className="w-2/3" />
      </div>
      <Skeleton shape="rect" className="mt-auto h-10 rounded-control" />
      <span className="sr-only">Loading member</span>
    </Card>
  )
}
