import { Check, MessageCircle, UserCheck, X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveOption } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink } from '../../../patterns'
import { Avatar, Badge, Button, Skeleton, Text } from '../../../primitives'
import { skeletonA11y } from '../skeletonA11y'

const STATUSES = ['pending', 'accepted', 'declined']

const roleLine = (title, company) => [title, company].filter(Boolean).join(' at ')

/**
 * An incoming connection request (the pending list on MembersPage, a member profile header).
 * - `name` (required), `title`, `company` ("Director of Demand Gen at Adatum"), `avatarSrc`.
 * - `status`: pending (default) shows Accept and Decline; accepted shows a Connected badge and,
 *   with `messageTo`, a Message link; declined shows a Declined badge.
 * - `onAccept`, `onDecline`, `accepting` / `declining` (busy button, the other one disabled).
 * - `to` / `href`: the name is the row's stretched link to the profile; the buttons sit above it.
 * A polite status region announces "Connected with Hana Kim" or "Declined Hana Kim" when the
 * status changes (`announce={false}` leaves it out); don't also toast the accept or decline. `as` (default div) and other props go to the Card.
 */
export function ConnectionRequest({
  name,
  title,
  company,
  avatarSrc,
  status,
  onAccept,
  onDecline,
  accepting = false,
  declining = false,
  messageTo,
  announce = true,
  to,
  href,
  as,
  className,
  ...props
}) {
  const resolvedStatus = resolveOption(status, STATUSES, 'pending', 'ConnectionRequest', 'status')
  const linked = to !== undefined || href !== undefined
  const role = roleLine(title, company)
  const showAction =
    resolvedStatus !== 'pending' || typeof onAccept === 'function' || typeof onDecline === 'function'
  const announcement =
    resolvedStatus === 'accepted' ? `Connected with ${name}` : resolvedStatus === 'declined' ? `Declined ${name}` : ''

  return (
    <Card
      as={as}
      variant="surface"
      padding="sm"
      interactive={linked}
      className={cn('flex flex-wrap items-center gap-ds-sm', className)}
      {...props}
    >
      <Avatar name={name} src={avatarSrc} size="md" />
      <div className="flex min-w-0 grow basis-40 flex-col">
        <Text as="span" size="body-sm" className="truncate font-semibold">
          {linked ? (
            <CardLink to={to} href={href}>
              {name}
            </CardLink>
          ) : (
            name
          )}
        </Text>
        {role && (
          <Text as="span" size="caption" tone="secondary" className="truncate">
            {role}
          </Text>
        )}
      </div>
      {showAction && (
        <CardAction className="flex shrink-0 items-center gap-ds-xs">
          {resolvedStatus === 'pending' && (
            <>
              {onAccept && (
                <Button
                  size="sm"
                  leadingIcon={Check}
                  loading={accepting}
                  disabled={declining}
                  onClick={onAccept}
                  aria-label={`Accept ${name}`}
                >
                  Accept
                </Button>
              )}
              {onDecline && (
                <Button
                  size="sm"
                  variant="ghost"
                  leadingIcon={X}
                  loading={declining}
                  disabled={accepting}
                  onClick={onDecline}
                  aria-label={`Decline ${name}`}
                >
                  Decline
                </Button>
              )}
            </>
          )}
          {resolvedStatus === 'accepted' && (
            <>
              <Badge tone="success" size="sm" leadingIcon={UserCheck}>
                Connected
              </Badge>
              {messageTo && (
                <Button size="sm" variant="outline" leadingIcon={MessageCircle} to={messageTo} aria-label={`Message ${name}`}>
                  Message
                </Button>
              )}
            </>
          )}
          {resolvedStatus === 'declined' && <Badge size="sm">Declined</Badge>}
        </CardAction>
      )}
      {announce && (
        <span role="status" className="sr-only">
          {announcement}
        </span>
      )}
    </Card>
  )
}

/**
 * Loading placeholder row with the ConnectionRequest layout. Busy with a hidden `label`; pass `announce={false}` inside a grid that sets
 * aria-busy on the list, so each placeholder isn't read out.
 */
export function ConnectionRequestSkeleton({ announce = true, label = 'Loading connection request', className, ...props }) {
  return (
    <Card variant="surface" padding="sm" {...skeletonA11y(announce)} className={cn('flex items-center gap-ds-sm', className)} {...props}>
      <Skeleton shape="circle" />
      <div className="flex grow flex-col gap-ds-xs">
        <Skeleton className="w-1/3" />
        <Skeleton className="w-1/2" />
      </div>
      <Skeleton shape="rect" className="h-10 w-40 rounded-control" />
      {announce && <span className="sr-only">{label}</span>}
    </Card>
  )
}
