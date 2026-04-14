import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import HoverCard from '../../components/ui/HoverCard'
import LazyImage from '../../components/ui/LazyImage'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { Calendar, Clock, Search } from 'lucide-react'

const categories = ['All', 'Content Strategy', 'ABM', 'AI & Tech', 'Growth']

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: 'live', page, limit: 20 })
      if (search) params.set('search', search)
      if (category !== 'All') params.set('category', category)
      const res = await fetch(`/api/sessions?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('mavuus_token')}` }
      })
      if (res.ok) {
        const json = await res.json()
        setSessions(json.data || json)
        setTotalPages(json.totalPages || 1)
        setTotal(json.total || 0)
      }
    } catch {}
    setLoading(false)
  }, [search, category, page])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Live Sessions</h1>
        <p className="text-neutral-500">Join upcoming live sessions with industry leaders.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-brand-pink text-white'
                  : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No sessions found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
            {sessions.map(session => (
              <Link key={session.id} to={`/dashboard/live-sessions/${session.id}`} className="block no-underline">
                <HoverCard>
                  <div className="relative h-40 rounded-xl mb-4 overflow-hidden">
                    <LazyImage
                      src={session.thumbnail_url}
                      alt={session.title}
                      className="absolute inset-0"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                      fallback={
                        <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 flex items-center justify-center">
                          <Calendar size={36} className="text-brand-blue/40" />
                        </div>
                      }
                    />
                  </div>
                  <Badge variant="blue">{session.category}</Badge>
                  <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{session.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                    <Calendar size={12} />
                    <span>{new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <Clock size={12} className="ml-2" />
                    <span>{session.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                    <Avatar name={session.speaker_name} src={session.speaker_avatar} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-dark-blue">{session.speaker_name}</p>
                      <p className="text-[11px] text-neutral-500">{session.speaker_title}</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4">View Details</Button>
                </HoverCard>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
