import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ListSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { jobs as fallbackJobs } from '../../data/mockData'
import { MapPin, Clock, DollarSign, Briefcase, Search, Bookmark } from 'lucide-react'

const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote']

export default function JobsPage() {
  const { token } = useAuth()
  const toast = useToast()
  const { data: jobs, loading } = useApiData('/api/jobs', fallbackJobs)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [saved, setSaved] = useState([])

  // Fetch saved jobs on mount to populate bookmark state
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
    const matchesType = type === 'All' || j.type === type
    return matchesSearch && matchesType
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Search for Jobs</h1>
        <p className="text-neutral-500">Exclusive job opportunities from the Mavuus community.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {jobTypes.map(t => (
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
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No jobs found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <Link key={job.id} to={`/dashboard/jobs/${job.id}`} className="block">
              <Card hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-dark-blue">{job.title}</h3>
                    <p className="text-sm text-brand-pink">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary_range}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-shrink-0">
                  <Badge variant="gray">{job.category}</Badge>
                  <button
                    onClick={(e) => toggleSave(e, job.id)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <Bookmark
                      size={16}
                      className={saved.includes(job.id) ? 'fill-brand-pink text-brand-pink' : 'text-neutral-400'}
                    />
                  </button>
                  <Button size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                    <Link to={`/dashboard/jobs/${job.id}`}>View</Link>
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
