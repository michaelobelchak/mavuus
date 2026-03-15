import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Badge from '../../components/ui/Badge'
import { ListSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { jobs as fallbackJobs } from '../../data/mockData'
import { MapPin, Clock, DollarSign, Briefcase, Search, Bookmark, Building2, Filter } from 'lucide-react'

const jobTypes = ['All', 'Full-time', 'Freelance', 'Contract']
const seniorityLevels = ['All', 'Junior', 'Mid', 'Senior', 'Lead']
const jobCategories = ['All', 'Content', 'Growth', 'Design', 'Analytics', 'Brand', 'SEO']

export default function JobsPage() {
  const { token } = useAuth()
  const toast = useToast()
  const { data: jobs, loading } = useApiData('/api/jobs', fallbackJobs)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [seniority, setSeniority] = useState('All')
  const [category, setCategory] = useState('All')
  const [saved, setSaved] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch('/api/jobs/saved', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const savedJobs = await res.json()
          setSaved(savedJobs.map(j => j.id))
        }
      } catch {}
    }
    if (token) fetchSaved()
  }, [token])

  const filtered = (jobs || []).filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    const matchesType = type === 'All' || (j.type || '').toLowerCase() === type.toLowerCase()
    const matchesSeniority = seniority === 'All' || j.seniority === seniority
    const matchesCategory = category === 'All' || j.category === category
    return matchesSearch && matchesType && matchesSeniority && matchesCategory
  })

  const toggleSave = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (saved.includes(id)) {
        await fetch(`/api/jobs/${id}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        setSaved(prev => prev.filter(s => s !== id))
        toast.info('Job removed from saved')
      } else {
        await fetch(`/api/jobs/${id}/save`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
        setSaved(prev => [...prev, id])
        toast.success('Job saved!')
      }
    } catch {}
  }

  const getShortDescription = (desc) => {
    if (!desc) return ''
    // Get first paragraph (before any ** section)
    const firstPara = desc.split('\n\n')[0]
    return firstPara.length > 150 ? firstPara.slice(0, 150) + '...' : firstPara
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const seniorityColor = (s) => {
    const map = { Junior: 'green', Mid: 'blue', Senior: 'pink', Lead: 'gray' }
    return map[s] || 'gray'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Search for Jobs</h1>
        <p className="text-neutral-500">Exclusive job opportunities from the Mavuus community.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            showFilters ? 'bg-brand-pink text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Job Type</p>
            <div className="flex gap-2 flex-wrap">
              {jobTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    type === t
                      ? 'bg-brand-pink text-white'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Seniority</p>
            <div className="flex gap-2 flex-wrap">
              {seniorityLevels.map(s => (
                <button
                  key={s}
                  onClick={() => setSeniority(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    seniority === s
                      ? 'bg-brand-pink text-white'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {jobCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    category === c
                      ? 'bg-brand-pink text-white'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-neutral-500 mb-4">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>
      )}

      {loading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Briefcase size={32} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-lg font-medium mb-1">No jobs found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => (
            <Link key={job.id} to={`/dashboard/jobs/${job.id}`} className="block group">
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-pink/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-dark-blue group-hover:text-brand-pink transition-colors truncate">{job.title}</h3>
                        {job.seniority && <Badge variant={seniorityColor(job.seniority)}>{job.seniority}</Badge>}
                      </div>
                      <p className="text-sm text-brand-pink font-medium">{job.company}</p>
                      <p className="text-sm text-neutral-500 mt-1.5 line-clamp-2">{getShortDescription(job.description)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500">
                        {job.location && (
                          <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary_range}</span>
                        )}
                        {job.category && <Badge variant="blue">{job.category}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => toggleSave(e, job.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <Bookmark
                        size={18}
                        className={saved.includes(job.id) ? 'fill-brand-pink text-brand-pink' : 'text-neutral-300 group-hover:text-neutral-400'}
                      />
                    </button>
                    <span className="text-xs text-neutral-400">{formatDate(job.created_at || job.posted_date)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
