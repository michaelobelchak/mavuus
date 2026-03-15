import { useState } from 'react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { onDemandVideos as fallbackVideos } from '../../data/mockData'
import { PlayCircle, Clock, Search } from 'lucide-react'

const categories = ['All', 'Paid Media', 'Branding', 'Analytics', 'SEO', 'Growth', 'MarTech']

export default function OnDemandPage() {
  const { data: videos, loading } = useApiData('/api/sessions?type=on-demand', fallbackVideos)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = (videos || []).filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.speaker_name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || v.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">On-Demand Videos</h1>
        <p className="text-neutral-500">Watch expert sessions anytime, anywhere.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
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
          <p className="text-lg font-medium mb-1">No videos found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(video => (
            <Card key={video.id} hover className="cursor-pointer group">
              <div className="h-40 rounded-xl mb-4 overflow-hidden relative">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-pink/10 to-purple-100" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <PlayCircle size={48} className="text-white/80 group-hover:text-white transition-colors drop-shadow-lg" />
                </div>
              </div>
              <Badge>{video.category}</Badge>
              <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{video.title}</h3>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                <span className="flex items-center gap-1"><Clock size={12} />{video.duration}</span>
                <span>{(video.views || 0).toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <Avatar name={video.speaker_name} src={video.speaker_avatar} size="sm" />
                <div>
                  <p className="text-xs font-medium text-dark-blue">{video.speaker_name}</p>
                  <p className="text-[11px] text-neutral-500">{video.speaker_title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
