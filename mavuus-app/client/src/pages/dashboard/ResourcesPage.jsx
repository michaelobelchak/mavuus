import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import HoverCard from '../../components/ui/HoverCard'
import LazyImage from '../../components/ui/LazyImage'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { FileText, ExternalLink, Search } from 'lucide-react'

const types = ['All', 'Guide', 'Template', 'Report', 'Playbook']

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (type !== 'All') params.set('category', type)
      const res = await fetch(`/api/resources?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('mavuus_token')}` }
      })
      if (res.ok) {
        const json = await res.json()
        setResources(json.data || json)
        setTotalPages(json.totalPages || 1)
      }
    } catch {}
    setLoading(false)
  }, [search, type, page])

  useEffect(() => { fetchResources() }, [fetchResources])

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Community Resources</h1>
        <p className="text-neutral-500">Templates, guides, and reports curated for marketing leaders.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1) }}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                type === t
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
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No resources found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
            {resources.map(resource => (
              <Link key={resource.id} to={`/dashboard/resources/${resource.id}`} className="block no-underline">
                <HoverCard className="cursor-pointer group">
                  <div className="relative h-40 rounded-xl mb-4 overflow-hidden">
                    <LazyImage
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="absolute inset-0"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                      fallback={
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                          <FileText size={36} className="text-brand-blue/40" />
                        </div>
                      }
                    />
                  </div>
                  <Badge variant="gray">{resource.category}</Badge>
                  <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2 group-hover:text-brand-pink transition-colors flex items-center gap-2">
                    {resource.title}
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{resource.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                    <span>{resource.author}</span>
                    <span>{resource.read_time}</span>
                  </div>
                </HoverCard>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Previous
              </button>
              <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
