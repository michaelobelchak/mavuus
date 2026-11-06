import { useId } from 'react'
import { Clock, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel, resolveOption } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink } from '../../../patterns'
import { Avatar, Badge, Button, Heading, Skeleton, Text } from '../../../primitives'
import { skeletonA11y } from '../skeletonA11y'

const CONNECTIONS = ['none', 'outgoing', 'incoming', 'connected']

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

// Pro gets the brand badge, free gets none, any other tier a neutral one.
function tierBadge(tier) {
  const key = typeof tier === 'string' ? tier.trim().toLowerCase() : ''
  if (!key || key === 'free') return null
  return { label: `${capitalize(key)} member`, tone: key === 'pro' ? 'brand' : 'neutral' }
}

function hasConnectionAction({ connection, onConnect, onAccept, isSelf }) {
  if (isSelf) return false
  if (connection === 'connected' || connection === 'outgoing') return true
  if (connection === 'incoming') return typeof onAccept === 'function'
  return typeof onConnect === 'function'
}

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
    return (
      <Button size="sm" block leadingIcon={UserPlus} onClick={onAccept} aria-label={`Accept request from ${name}`}>
        Accept request
      </Button>
    )
  }
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
 * - `name` (required), `title`, `company`, `avatarSrc` (initials when missing), `tier` ("pro"
 *   shows a brand "Pro member" badge, other paid tiers a neutral one, free none; no avatar ring).
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
  const titleId = useId()
  const resolvedConnection = resolveOption(connection, CONNECTIONS, 'none', 'MemberCard', 'connection')
  const linked = to !== undefined || href !== undefined
  const showAction = hasConnectionAction({ connection: resolvedConnection, onConnect, onAccept, isSelf })
  const badge = tierBadge(tier)
  const action = showAction && (
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
      aria-labelledby={titleId}
      as={as}
      interactive={linked}
      className={cn('flex h-full flex-col items-center gap-ds-md text-center', className)}
      {...props}
    >
      <Avatar name={name} src={avatarSrc} size="lg" />
      <div className="flex w-full min-w-0 flex-col gap-ds-xxs">
        <Heading id={titleId} level={level} size="h4" className="truncate">
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
      {(badge || pending || resolvedConnection === 'connected') && (
        <div className="flex flex-wrap items-center justify-center gap-ds-xs">
          {badge && (
            <Badge size="sm" tone={badge.tone}>
              {badge.label}
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
      {showAction && <CardAction className="mt-auto w-full">{action}</CardAction>}
    </Card>
  )
}

/**
 * Loading placeholder with the MemberCard layout. Busy with a hidden `label`; pass `announce={false}` inside a grid that sets
 * aria-busy on the list, so each placeholder isn't read out.
 */
export function MemberCardSkeleton({ announce = true, label = 'Loading member', className, ...props }) {
  return (
    <Card {...skeletonA11y(announce)} className={cn('flex h-full flex-col items-center gap-ds-md', className)} {...props}>
      <Skeleton shape="circle" className="size-14" />
      <div className="flex w-full flex-col items-center gap-ds-xs">
        <Skeleton className="w-1/2" />
        <Skeleton className="w-2/3" />
      </div>
      <Skeleton shape="rect" className="mt-auto h-10 rounded-control" />
      {announce && <span className="sr-only">{label}</span>}
    </Card>
  )
}
