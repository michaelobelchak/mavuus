import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import { Textarea } from '../../components/ui/Input'
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, ArrowLeft, Building2, Calendar, Send, CheckCircle, Users, Briefcase } from 'lucide-react'

function renderDescription(text) {
  if (!text) return null
  const sections = text.split('\n\n')
  return sections.map((section, i) => {
    const trimmed = section.trim()
    if (!trimmed) return null

    // Bold header like **Responsibilities:**
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      const heading = trimmed.replace(/\*\*/g, '')
      return <h4 key={i} className="text-base font-semibold text-dark-blue mt-6 mb-2">{heading}</h4>
    }

    // Section with bold header followed by bullet list
    if (trimmed.startsWith('**')) {
      const lines = trimmed.split('\n')
      const headingLine = lines[0].replace(/\*\*/g, '')
      const bullets = lines.slice(1).filter(l => l.trim().startsWith('-'))
      if (bullets.length > 0) {
        return (
          <div key={i} className="mt-5">
            <h4 className="text-base font-semibold text-dark-blue mb-2">{headingLine}</h4>
            <ul className="space-y-1.5 ml-1">
              {bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
                  <span className="w-1.5 h-1.5 bg-brand-pink rounded-full mt-1.5 flex-shrink-0" />
                  {b.replace(/^-\s*/, '').trim()}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    }

    // Bullet list without heading
    if (trimmed.startsWith('-')) {
      const bullets = trimmed.split('\n').filter(l => l.trim().startsWith('-'))
      return (
        <ul key={i} className="space-y-1.5 ml-1 mt-2">
          {bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="w-1.5 h-1.5 bg-brand-pink rounded-full mt-1.5 flex-shrink-0" />
              {b.replace(/^-\s*/, '').trim()}
            </li>
          ))}
        </ul>
      )
    }

    // Plain paragraph
    return <p key={i} className="text-sm text-neutral-600 leading-relaxed mt-2">{trimmed}</p>
  })
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, savedRes, appsRes] = await Promise.all([
          fetch(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs/saved', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (jobRes.ok) setJob(await jobRes.json())
        if (savedRes.ok) {
          const savedJobs = await savedRes.json()
          setSaved(savedJobs.some(j => j.id === parseInt(id)))
        }
        if (appsRes.ok) {
          const apps = await appsRes.json()
          const myApp = apps.find(a => a.job_id === parseInt(id))
          if (myApp) setApplied(myApp)
        }
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const toggleSave = async () => {
    try {
      if (saved) {
        await fetch(`/api/jobs/${id}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        setSaved(false)
        toast.info('Job removed from saved')
      } else {
        await fetch(`/api/jobs/${id}/save`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
        setSaved(true)
        toast.success('Job saved!')
      }
    } catch {}
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST', headers, body: JSON.stringify({ cover_letter: coverLetter })
      })
      if (res.ok) {
        toast.success('Application submitted!')
        setShowApplyModal(false)
        setApplied({ status: 'applied', applied_at: new Date().toISOString() })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to apply')
      }
    } catch { toast.error('Network error') }
    finally { setApplying(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Job not found</p>
        <Link to="/dashboard/jobs" className="text-brand-pink hover:underline mt-2 inline-block">Back to Jobs</Link>
      </div>
    )
  }

  const isMyJob = job.posted_by === user?.id
  const statusColors = {
    applied: 'blue', reviewing: 'pink', interview: 'green', offer: 'green', rejected: 'gray'
  }

  return (
    <div className="max-w-6xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue mb-4 cursor-pointer">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-dark-blue">{job.title}</h1>
                  {job.seniority && <Badge variant="pink">{job.seniority}</Badge>}
                </div>
                <p className="text-lg text-neutral-600 flex items-center gap-2">
                  <Building2 size={18} /> {job.company}
                </p>
              </div>
              <button onClick={toggleSave} className="text-neutral-400 hover:text-brand-pink transition-colors cursor-pointer flex-shrink-0">
                {saved ? <BookmarkCheck size={24} className="text-brand-pink fill-brand-pink" /> : <Bookmark size={24} />}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {job.location && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <MapPin size={14} /> {job.location}
                </span>
              )}
              {job.type && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <Clock size={14} /> {job.type}
                </span>
              )}
              {job.salary_range && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <DollarSign size={14} /> {job.salary_range}
                </span>
              )}
              {job.category && <Badge variant="blue">{job.category}</Badge>}
            </div>

            {applied && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl mb-6">
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">You applied for this position</p>
                  <p className="text-xs text-green-600">
                    Applied {new Date(applied.applied_at).toLocaleDateString()} · Status: <Badge variant={statusColors[applied.status] || 'gray'}>{applied.status}</Badge>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">About this role</h3>
            <div>
              {renderDescription(job.description) || (
                <p className="text-neutral-500">No detailed description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            {isMyJob ? (
              <>
                <p className="text-sm text-neutral-500 mb-3">You posted this job</p>
                <Link to="/dashboard/my-jobs">
                  <Button variant="outline" className="w-full"><Users size={16} /> View Applicants</Button>
                </Link>
              </>
            ) : applied ? (
              <Button variant="outline" className="w-full" disabled>
                <CheckCircle size={16} /> Applied
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setShowApplyModal(true)}>
                <Send size={16} /> Apply Now
              </Button>
            )}
            <Button variant="outline" className="w-full mt-3" onClick={toggleSave}>
              {saved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save Job</>}
            </Button>
          </div>

          {/* Job Meta */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h4 className="font-semibold text-dark-blue mb-3">Job Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Posted</span>
                <span className="text-dark-blue">{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Type</span>
                <span className="text-dark-blue capitalize">{job.type || 'N/A'}</span>
              </div>
              {job.seniority && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Seniority</span>
                  <span className="text-dark-blue">{job.seniority}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Category</span>
                <span className="text-dark-blue">{job.category || 'N/A'}</span>
              </div>
              {job.salary_range && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Salary</span>
                  <span className="text-dark-blue">{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Posted By */}
          {job.poster_name && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h4 className="font-semibold text-dark-blue mb-3">Posted by</h4>
              <Link to={`/dashboard/members/${job.posted_by}`} className="flex items-center gap-3 hover:bg-neutral-50 rounded-xl p-2 -m-2 transition-colors">
                <Avatar name={job.poster_name} src={job.poster_avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium text-dark-blue">{job.poster_name}</p>
                  <p className="text-xs text-neutral-500">{job.poster_title}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title={`Apply for ${job.title}`} size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <p className="text-sm font-medium text-dark-blue">{job.title}</p>
            <p className="text-xs text-neutral-500">{job.company} · {job.location}</p>
          </div>
          <Textarea
            label="Cover Letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            placeholder="Tell the employer why you're a great fit for this role..."
          />
          <p className="text-xs text-neutral-500">Your profile information will be shared with the employer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
