import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { communityResources as fallbackResources } from '../../data/mockData'
import { FileText, ExternalLink, Search } from 'lucide-react'

const types = ['All', 'Guide', 'Template', 'Report', 'Playbook']

export default function ResourcesPage() {
  const { data: resources, loading } = useApiData('/api/resources', fallbackResources)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')

  const filtered = (resources || []).filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = type === 'All' || r.category === type
    return matchesSearch && matchesType
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Community Resources</h1>
        <p className="text-neutral-500">Templates, guides, and reports curated for marketing leaders.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No resources found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
          {filtered.map(resource => (
            <Link key={resource.id} to={`/dashboard/resources/${resource.id}`} className="block no-underline">
            <Card hover className="cursor-pointer group">
              <div className="h-40 rounded-xl mb-4 overflow-hidden">
                {resource.thumbnail_url ? (
                  <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                    <FileText size={36} className="text-brand-blue/40" />
                  </div>
                )}
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
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
