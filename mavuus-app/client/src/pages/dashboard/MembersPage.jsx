import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, useToast } from '@/design-system/patterns'
import { ConnectionRequest, MemberCard, MemberCardSkeleton } from '@/design-system/organisms'
import { Heading } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { CatalogList } from './shared/CatalogList'
import { MEMBERS_PATH, MESSAGES_PATH } from './shared/paths'

const FILTERS = [{ value: 'connections', label: 'My Connections' }, 'All', { value: 'pro', label: 'Pro' }, { value: 'free', label: 'Free' }]

// Headers for the connection requests: the token, and a JSON body type when there is a body.
const authHeaders = (token, { json = false } = {}) => ({
  Authorization: `Bearer ${token}`,
  ...(json ? { 'Content-Type': 'application/json' } : {}),
})

// The chips as /api/members params: your connections, or a membership tier.
const filterQuery = (value) => (value === 'connections' ? { connections: '1' } : { tier: value })

// MemberCard's connection for an entry of the connections map.
function connectionOf(conn) {
  if (!conn) return 'none'
  if (conn.status === 'accepted') return 'connected'
  return conn.direction === 'incoming' ? 'incoming' : 'outgoing'
}

/**
 * The connections map ({ [userId]: { status, direction, id } }), the incoming requests and the
 * accepted ids, from /api/connections and /api/connections/pending.
 */
function useConnections(token) {
  const [connections, setConnections] = useState({})
  const [pendingIncoming, setPendingIncoming] = useState([])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    const headers = authHeaders(token)
    Promise.all([
      fetch('/api/connections', { headers, signal: controller.signal }),
      fetch('/api/connections/pending', { headers, signal: controller.signal }),
    ])
      .then(async ([connRes, pendingRes]) => {
        const map = {}
        const accepted = connRes.ok ? await connRes.json() : []
        if (Array.isArray(accepted)) {
          accepted.forEach((conn) => {
            map[conn.connected_user_id] = { status: 'accepted', id: conn.id }
          })
        }
        const pending = pendingRes.ok ? await pendingRes.json() : null
        const incoming = Array.isArray(pending?.incoming) ? pending.incoming : []
        if (Array.isArray(pending?.outgoing)) {
          pending.outgoing.forEach((p) => {
            map[p.user_id] = { status: 'pending', direction: 'outgoing', id: p.id }
          })
          incoming.forEach((p) => {
            map[p.user_id] = { status: 'pending', direction: 'incoming', id: p.id }
          })
        }
        if (controller.signal.aborted) return
        setConnections(map)
        setPendingIncoming(incoming)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error('Failed to load connections', err)
      })
    return () => controller.abort()
  }, [token])

  return { connections, setConnections, pendingIncoming, setPendingIncoming }
}

export default function MembersPage() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter') || 'All'
  const { connections, setConnections, pendingIncoming, setPendingIncoming } = useConnections(token)
  const [connectingIds, setConnectingIds] = useState(() => new Set())
  // Pending requests being answered: request id -> 'accept' or 'decline'.
  const [answering, setAnswering] = useState(() => new Map())

  const handleConnect = useCallback(
    async (memberId) => {
      setConnectingIds((prev) => new Set(prev).add(memberId))
      try {
        const res = await fetch('/api/connections/request', {
          method: 'POST',
          headers: authHeaders(token, { json: true }),
          body: JSON.stringify({ userId: memberId }),
        })
        if (res.ok) {
          setConnections((prev) => ({ ...prev, [memberId]: { status: 'pending', direction: 'outgoing' } }))
          toast.success('Connection request sent!')
        } else {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || 'Failed to send request')
        }
      } catch {
        toast.error('Network error')
      } finally {
        setConnectingIds((prev) => {
          const next = new Set(prev)
          next.delete(memberId)
          return next
        })
      }
    },
    [token, toast, setConnections],
  )

  const answer = async (request, action) => {
    if (answering.has(request.id)) return
    setAnswering((prev) => new Map(prev).set(request.id, action))
    try {
      const res = await fetch(`/api/connections/${request.id}/${action}`, { method: 'PUT', headers: authHeaders(token, { json: true }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPendingIncoming((prev) => prev.filter((p) => p.id !== request.id))
      if (action === 'accept') {
        setConnections((prev) => ({ ...prev, [request.user_id]: { status: 'accepted', id: request.id } }))
        toast.success('Connection accepted!')
      } else {
        setConnections((prev) => {
          const next = { ...prev }
          delete next[request.user_id]
          return next
        })
        toast.info('Connection declined')
      }
    } catch {
      toast.error(action === 'accept' ? 'Failed to accept' : 'Failed to decline')
    } finally {
      setAnswering((prev) => {
        const next = new Map(prev)
        next.delete(request.id)
        return next
      })
    }
  }

  return (
    <CatalogList
      endpoint="/api/members"
      filterParam="filter"
      filterLabel="Filter members"
      categories={FILTERS}
      filterQuery={filterQuery}
      intro="Connect with marketing leaders in the community."
      searchLabel="Search members"
      searchPlaceholder="Search members..."
      listLabel="Members"
      emptyTitle={(value) => (value === 'connections' ? 'No connections yet' : 'No members found')}
      emptyDescription={(value) =>
        value === 'connections' ? 'Connect with members to see them here.' : 'Try adjusting your search or filters.'
      }
      errorTitle="We couldn't load the members"
      skeleton={MemberCardSkeleton}
      renderItem={(member) => (
        <MemberCard
          name={member.name}
          title={member.title}
          company={member.company}
          avatarSrc={member.avatar_url}
          tier={member.tier || member.membership_tier}
          connection={connectionOf(connections[member.id])}
          onConnect={() => handleConnect(member.id)}
          connecting={connectingIds.has(member.id)}
          messageTo={`${MESSAGES_PATH}?user=${member.id}`}
          isSelf={Boolean(user) && member.id === user.id}
          to={`${MEMBERS_PATH}/${member.id}`}
        />
      )}
    >
      {pendingIncoming.length > 0 && filter !== 'connections' && (
        <Card as="section" variant="panel-pink" padding="md" aria-labelledby="pending-requests-title" className="flex flex-col gap-ds-sm">
          <Heading id="pending-requests-title" level={2} size="h4">
            {`Pending connection requests (${pendingIncoming.length})`}
          </Heading>
          <ul className="flex flex-col gap-ds-xs">
            {pendingIncoming.map((request) => (
              <li key={request.id}>
                <ConnectionRequest
                  name={request.name}
                  title={request.title}
                  company={request.company}
                  avatarSrc={request.avatar_url}
                  to={`${MEMBERS_PATH}/${request.user_id}`}
                  onAccept={() => answer(request, 'accept')}
                  onDecline={() => answer(request, 'decline')}
                  accepting={answering.get(request.id) === 'accept'}
                  declining={answering.get(request.id) === 'decline'}
                  announce={false}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </CatalogList>
  )
}
