import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import HoverCard from '../../components/ui/HoverCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { Star, MapPin, ExternalLink, Search } from 'lucide-react'

const vendorCategories = ['All', 'Content Marketing', 'Demand Gen', 'Branding', 'Analytics', 'PR', 'Video Production']

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (category !== 'All') params.set('category', category)
      const res = await fetch(`/api/vendors?${params}`)
      if (res.ok) {
        const json = await res.json()
        setVendors(json.data || json)
        setTotalPages(json.totalPages || 1)
      }
    } catch {}
    setLoading(false)
  }, [search, category, page])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Search for Vendors</h1>
        <p className="text-neutral-500">Find vetted vendors recommended by the community.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {vendorCategories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category === cat ? 'bg-brand-pink text-white' : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
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
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No vendors found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
            {vendors.map(vendor => (
              <Link key={vendor.id} to={`/dashboard/vendors/${vendor.id}`} className="block no-underline">
                <HoverCard>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-blue font-bold text-sm">
                      {(vendor.company_name || 'Mv').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'MV'}
                    </div>
                    <div className="flex-1 flex items-start justify-between">
                      <h3 className="text-base font-semibold text-dark-blue">{vendor.company_name}</h3>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star size={12} className="fill-yellow-400" />
                        <span className="font-medium">{vendor.rating}</span>
                        <span className="text-neutral-400">({vendor.reviews_count})</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{vendor.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(vendor.categories || []).map(cat => (
                      <Badge key={cat} variant="blue">{cat}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mb-4">
                    <MapPin size={12} />
                    <span>{vendor.location}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile <ExternalLink size={14} />
                  </Button>
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
