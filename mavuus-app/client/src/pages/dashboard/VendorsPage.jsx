import { useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { vendors as fallbackVendors } from '../../data/mockData'
import { Star, MapPin, ExternalLink, Search } from 'lucide-react'

const vendorCategories = ['All', 'SEO', 'Content', 'Analytics', 'Design', 'Social Media']

export default function VendorsPage() {
  const { data: vendors, loading } = useApiData('/api/vendors', fallbackVendors)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = (vendors || []).filter(v => {
    const matchesSearch = v.company_name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' ||
      (v.categories && v.categories.some(c => c.toLowerCase().includes(category.toLowerCase())))
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Search for Vendors</h1>
        <p className="text-neutral-500">Find vetted vendors recommended by the community.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {vendorCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No vendors found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vendor => (
            <Card key={vendor.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-dark-blue">{vendor.company_name}</h3>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star size={12} className="fill-yellow-400" />
                  <span className="font-medium">{vendor.rating}</span>
                  <span className="text-neutral-400">({vendor.reviews_count})</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{vendor.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.categories.map(cat => (
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
