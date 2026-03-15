import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { members as fallbackMembers } from '../../data/mockData'
import { Search, UserPlus, UserCheck, Clock } from 'lucide-react'

const tiers = ['All', 'Pro', 'Free']

export default function MembersPage() {
  const { data: members, loading } = useApiData('/api/members', fallbackMembers)
  const { user, token } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('All')
  const [connections, setConnections] = useState({})
  const [connectingIds, setConnectingIds] = useState(new Set())

  // Fetch connection statuses for all members
  useEffect(() => {
    if (!token) return

    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/connections', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          // Build a map of userId -> { status, direction, id }
          const connMap = {}
          if (Array.isArray(data)) {
            data.forEach((conn) => {
              const otherId =
                conn.from_user_id === user?.id
                  ? conn.to_user_id
                  : conn.from_user_id
              connMap[otherId] = {
                status: conn.status,
                direction:
                  conn.from_user_id === user?.id ? 'outgoing' : 'incoming',
                id: conn.id,
              }
            })
          }
          setConnections(connMap)
        }
      } catch {
        // Silently fail — connection status is non-critical
      }
    }

    fetchConnections()
  }, [token, user?.id])

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

  const filtered = (members || []).filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.title.toLowerCase().includes(search.toLowerCase())
    const memberTier = m.tier || m.membership_tier
    const matchesTier = tier === 'All' || memberTier?.toLowerCase() === tier.toLowerCase()
    return matchesSearch && matchesTier
  })

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

  const renderConnectButton = (member) => {
    const conn = connections[member.id]

    // Don't show connect button for yourself
    if (user && member.id === user.id) return null

    if (conn?.status === 'accepted') {
      return (
        <Button variant="outline" size="sm" className="w-full mt-4" disabled>
          <UserCheck size={14} /> Connected
        </Button>
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

    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={(e) => handleConnect(e, member.id)}
        disabled={connectingIds.has(member.id)}
      >
        <UserPlus size={14} />{' '}
        {connectingIds.has(member.id) ? 'Sending...' : 'Connect'}
      </Button>
    )
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
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                tier === t
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No members found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((member) => (
            <Link
              key={member.id}
              to={`/dashboard/members/${member.id}`}
              className="block no-underline"
            >
              <Card hover className="text-center h-full">
                <Avatar
                  name={member.name}
                  src={member.avatar_url}
                  size="xl"
                  className="mx-auto mb-4"
                />
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
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
