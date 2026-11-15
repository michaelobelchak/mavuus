import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, Share2, Users } from 'lucide-react'
import { copyText } from '@/design-system/lib/copyText'
import { formatDate, toDateTime } from '@/design-system/lib/formatDate'
import { Alert, EmptyState, FormField, ShareDialog, useToast } from '@/design-system/patterns'
import { Avatar, Button, Caption, Input, Skeleton, Text } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { DetailSection } from './shared/DetailSection'

const COPIED_MS = 2000
const INVITE_MESSAGE = "I'd like you to join me on Mavuus, a community for marketing leaders:"

function useReferrals(token) {
  const [state, setState] = useState({ status: 'loading', code: '', count: 0, referrals: [] })
  const load = useCallback(
    async (signal) => {
      const headers = { Authorization: `Bearer ${token}` }
      try {
        const [codeRes, statsRes] = await Promise.all([
          fetch('/api/referrals/my-code', { headers, signal }),
          fetch('/api/referrals/stats', { headers, signal }),
        ])
        if (!codeRes.ok) throw new Error(`HTTP ${codeRes.status}`)
        const { code } = await codeRes.json()
        const stats = statsRes.ok ? await statsRes.json() : null
        if (signal?.aborted) return
        setState({
          status: 'ready',
          code,
          statsFailed: !stats,
          count: stats?.count || 0,
          referrals: Array.isArray(stats?.referrals) ? stats.referrals : [],
        })
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return
        setState({ status: 'error', code: '', count: 0, referrals: [] })
      }
    },
    [token],
  )
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])
  const retry = () => {
    setState({ status: 'loading', code: '', count: 0, referrals: [] })
    load()
  }
  return [state, retry]
}

/** People who joined with the member's link: avatar, name, role and the day they joined. */
function ReferralList({ referrals }) {
  return (
    <ul aria-label="People you invited" className="flex flex-col gap-ds-xs">
      {referrals.map((person) => (
        <li key={person.id} className="flex items-center gap-ds-sm rounded-control bg-surface-sunken p-ds-sm">
          <Avatar name={person.name} src={person.avatar_url} size="md" />
          <div className="flex min-w-0 grow flex-col">
            <Text as="span" size="body-sm" className="truncate font-semibold">
              {person.name}
            </Text>
            {(person.title || person.company) && (
              <Caption className="truncate">{[person.title, person.company].filter(Boolean).join(', ')}</Caption>
            )}
          </div>
          <Caption className="shrink-0">
            Joined <time dateTime={toDateTime(person.created_at)}>{formatDate(person.created_at)}</time>
          </Caption>
        </li>
      ))}
    </ul>
  )
}

/**
 * Invite: the member's referral link (copy, or share through the networks and an email invite) and
 * the people who joined with it. Sign-ups through the link count once registration records `?ref=`.
 */
export default function InvitePage() {
  const { token } = useAuth()
  const toast = useToast()
  const [data, retry] = useReferrals(token)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const linkRef = useRef(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const link = data.code ? `${window.location.origin}/register?ref=${encodeURIComponent(data.code)}` : ''

  const copy = async () => {
    if (await copyText(link, linkRef.current)) {
      toast.success('Link copied to clipboard')
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_MS)
    } else {
      toast.error("Couldn't copy the link. Select it and copy it instead.")
    }
  }

  const intro = <Text tone="secondary">Invite marketing leaders to Mavuus with your personal link.</Text>

  if (data.status === 'loading') {
    return (
      <div aria-busy="true" className="flex max-w-3xl flex-col gap-ds-lg">
        {intro}
        <p role="status" className="sr-only">
          Loading your invite link
        </p>
        <Skeleton shape="rect" className="h-48" />
        <Skeleton shape="rect" className="h-40" />
      </div>
    )
  }
  if (data.status === 'error') {
    return (
      <div className="flex max-w-3xl flex-col gap-ds-lg">
        {intro}
        <Alert
          tone="error"
          title="We couldn't load your invite link"
          description="Check your connection and try again."
          actions={
            <Button size="sm" variant="outline" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-ds-lg">
      {intro}
      <DetailSection title="Your invite link">
        <Text size="body-sm" tone="secondary">
          Anyone who signs up with this link is added to your referrals.
        </Text>
        <FormField label="Invite link" hint={`Your referral code is ${data.code}.`}>
          <Input
            ref={linkRef}
            readOnly
            value={link}
            onFocus={(event) => event.target.select()}
            trailing={
              <Button size="sm" leadingIcon={copied ? Check : Copy} onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            }
          />
        </FormField>
        <Button variant="outline" leadingIcon={Share2} onClick={() => setShareOpen(true)} className="self-start">
          Share or email your link
        </Button>
      </DetailSection>

      <DetailSection title="Your referrals">
        {data.statsFailed ? (
          <Alert
            tone="error"
            title="We couldn't load your referrals"
            actions={
              <Button size="sm" variant="outline" onClick={retry}>
                Try again
              </Button>
            }
          />
        ) : data.referrals.length === 0 ? (
          <EmptyState
            size="sm"
            headingLevel={3}
            icon={Users}
            title="No referrals yet"
            description="Share your link to get started. People who join with it show up here."
          />
        ) : (
          <>
            <Text size="body-sm" tone="secondary">
              {`You've invited ${data.count} ${data.count === 1 ? 'person' : 'people'}.`}
            </Text>
            <ReferralList referrals={data.referrals} />
          </>
        )}
      </DetailSection>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share your invite link"
        url={link}
        shareTitle="Join me on Mavuus"
        inviteMessage={INVITE_MESSAGE}
      />
    </div>
  )
}
