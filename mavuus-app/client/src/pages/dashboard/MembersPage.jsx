import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import HoverCard from '../../components/ui/HoverCard'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { members as fallbackMembers } from '../../data/mockData'
import { Search, UserPlus, UserCheck, Clock, MessageCircle, Check, X } from 'lucide-react'

const tiers = ['All', 'Pro', 'Free']

export default function MembersPage() {
  const { data: members, loading } = useApiData('/api/members', fallbackMembers)
  const { user, token } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('All')
  const [connections, setConnections] = useState({})
  const [connectingIds, setConnectingIds] = useState(new Set())
  const [pendingIncoming, setPendingIncoming] = useState([])
  const [myConnectionIds, setMyConnectionIds] = useState(new Set())

  const filter = searchParams.get('filter') || 'all'

  // Fetch connection statuses and pending requests
  useEffect(() => {
    if (!token) return

    const fetchConnections = async () => {
      try {
        const [connRes, pendingRes] = await Promise.all([
          fetch('/api/connections', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/connections/pending', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (connRes.ok) {
          const data = await connRes.json()
          const connMap = {}
          const connIds = new Set()
          if (Array.isArray(data)) {
            data.forEach((conn) => {
              const otherId = conn.connected_user_id
              connMap[otherId] = { status: 'accepted', id: conn.id }
              connIds.add(otherId)
            })
          }
          setConnections(connMap)
          setMyConnectionIds(connIds)
        }
        if (pendingRes.ok) {
          const pending = await pendingRes.json()
          setPendingIncoming(pending.incoming || [])
          // Add pending statuses to connections map
          if (pending.outgoing) {
            setConnections(prev => {
              const updated = { ...prev }
              pending.outgoing.forEach(p => {
                updated[p.user_id] = { status: 'pending', direction: 'outgoing', id: p.id }
              })
              pending.incoming.forEach(p => {
                updated[p.user_id] = { status: 'pending', direction: 'incoming', id: p.id }
              })
              return updated
            })
          }
        }
      } catch {
        // Silently fail — connection status is non-critical
      }
    }

    fetchConnections()
  }, [token])

  const handleConnect = useCallback(
    async (e, memberId) => {
      e.preventDefault()
      e.stopPropagation()

      setConnectingIds((prev) => new Set([...prev, memberId]))
      try {
        const res = await fetch('/api/connections/request', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: memberId }),
        })
        if (res.ok) {
          setConnections((prev) => ({
            ...prev,
            [memberId]: { status: 'pending', direction: 'outgoing' },
          }))
          toast.success('Connection request sent!')
        } else {
          const data = await res.json()
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
    [token, toast]
  )

  const handleAcceptPending = async (e, connId, userId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(`/api/connections/${connId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setPendingIncoming(prev => prev.filter(p => p.id !== connId))
        setConnections(prev => ({ ...prev, [userId]: { status: 'accepted', id: connId } }))
        setMyConnectionIds(prev => new Set([...prev, userId]))
        toast.success('Connection accepted!')
      }
    } catch {
      toast.error('Failed to accept')
    }
  }

  const handleDeclinePending = async (e, connId, userId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(`/api/connections/${connId}/decline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setPendingIncoming(prev => prev.filter(p => p.id !== connId))
        setConnections(prev => {
          const updated = { ...prev }
          delete updated[userId]
          return updated
        })
        toast.info('Connection declined')
      }
    } catch {
      toast.error('Failed to decline')
    }
  }

  const filtered = (members || []).filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company?.toLowerCase().includes(search.toLowerCase()) ||
      m.title?.toLowerCase().includes(search.toLowerCase())
    const memberTier = m.tier || m.membership_tier
    const matchesTier = tier === 'All' || memberTier?.toLowerCase() === tier.toLowerCase()
    const matchesFilter = filter === 'all' || (filter === 'connections' && myConnectionIds.has(m.id))
    return matchesSearch && matchesTier && matchesFilter
  })

  const renderConnectButton = (member) => {
    const conn = connections[member.id]

    // Don't show connect button for yourself
    if (user && member.id === user.id) return null

    if (conn?.status === 'accepted') {
      return (
        <Link
          to={`/dashboard/messages?user=${member.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block"
        >
          <Button variant="outline" size="sm" className="w-full mt-4">
            <MessageCircle size={14} /> Message
          </Button>
        </Link>
      )
    }

    if (conn?.status === 'pending') {
      return (
        <Button variant="outline" size="sm" className="w-full mt-4" disabled>
          <Clock size={14} />{' '}
          {conn.direction === 'outgoing' ? 'Request Sent' : 'Pending'}
        </Button>
      )
    }

    const isConnecting = connectingIds.has(member.id)
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={(e) => handleConnect(e, member.id)}
        loading={isConnecting}
      >
        {!isConnecting && <UserPlus size={14} />}
        {isConnecting ? 'Sending…' : 'Connect'}
      </Button>
    )
  }

  const renderConnectionIndicator = (memberId) => {
    const conn = connections[memberId]
    if (!conn) return null

    if (conn.status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <UserCheck size={12} /> Connected
        </span>
      )
    }
    if (conn.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
          <Clock size={12} /> Pending
        </span>
      )
    }
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">
          Meet The Members
        </h1>
        <p className="text-neutral-500">
          Connect with marketing leaders in the community.
        </p>
      </div>

      {/* Pending Incoming Requests */}
      {pendingIncoming.length > 0 && filter !== 'connections' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">
            Pending Connection Requests ({pendingIncoming.length})
          </h3>
          <div className="space-y-2">
            {pendingIncoming.map((req) => (
              <div key={req.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                <Link to={`/dashboard/members/${req.user_id}`} className="flex items-center gap-3 no-underline">
                  <Avatar name={req.name} src={req.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-dark-blue">{req.name}</p>
                    <p className="text-xs text-neutral-500">{req.title} at {req.company}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleAcceptPending(e, req.id, req.user_id)}
                    className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeclinePending(e, req.id, req.user_id)}
                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams(filter === 'connections' ? {} : { filter: 'connections' })}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === 'connections'
                ? 'bg-brand-pink text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            My Connections
          </button>
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => { setTier(t); if (filter === 'connections') setSearchParams({}) }}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                tier === t && filter !== 'connections'
                  ? 'bg-brand-pink text-white'
                  : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">
            {filter === 'connections' ? 'No connections yet' : 'No members found'}
          </p>
          <p className="text-sm">
            {filter === 'connections' ? 'Connect with members to see them here.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
          {filtered.map((member) => (
            <Link
              key={member.id}
              to={`/dashboard/members/${member.id}`}
              className="block no-underline"
            >
              <HoverCard className="text-center h-full">
                <div className="flex justify-center mb-4">
                  <Avatar
                    name={member.name}
                    src={member.avatar_url}
                    size="xl"
                    pro={(member.tier || member.membership_tier) === 'pro'}
                  />
                </div>
                <h3 className="text-base font-semibold text-dark-blue">
                  {member.name}
                </h3>
                <p className="text-sm text-neutral-500 mb-1">{member.title}</p>
                <p className="text-sm text-brand-pink mb-3">{member.company}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="pink">{member.tier || member.membership_tier} Member</Badge>
                  {renderConnectionIndicator(member.id)}
                </div>
                {renderConnectButton(member)}
              </HoverCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
