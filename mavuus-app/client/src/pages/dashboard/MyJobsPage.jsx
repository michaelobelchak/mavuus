import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Input, { Textarea } from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { Briefcase, Bookmark, FileText, Plus, MapPin, Clock, DollarSign, Trash2, Eye, Users } from 'lucide-react'

export default function MyJobsPage() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [myPostings, setMyPostings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: '', company: user?.company || '', description: '', location: '', type: 'full-time', category: '', salary_range: ''
  })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchAll = async () => {
    try {
      const [appsRes, savedRes, postingsRes] = await Promise.all([
        fetch('/api/jobs/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/jobs/saved', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/jobs/my-postings', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (appsRes.ok) setApplications(await appsRes.json())
      if (savedRes.ok) setSavedJobs(await savedRes.json())
      if (postingsRes.ok) setMyPostings(await postingsRes.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const unsaveJob = async (jobId) => {
    try {
      await fetch(`/api/jobs/${jobId}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setSavedJobs(prev => prev.filter(j => j.id !== jobId))
      toast.success('Job removed from saved')
    } catch {}
  }

  const postJob = async () => {
    if (!jobForm.title || !jobForm.company) {
      toast.error('Title and company are required')
      return
    }
    setPosting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST', headers, body: JSON.stringify(jobForm)
      })
      if (res.ok) {
        toast.success('Job posted!')
        setShowPostModal(false)
        setJobForm({ title: '', company: user?.company || '', description: '', location: '', type: 'full-time', category: '', salary_range: '' })
        fetchAll()
        setActiveTab('postings')
      }
    } catch { toast.error('Failed to post job') }
    finally { setPosting(false) }
  }

  const statusColors = {
    applied: 'blue', reviewing: 'pink', interview: 'green', offer: 'green', rejected: 'gray', withdrawn: 'gray'
  }

  const tabs = [
    { id: 'applications', label: 'My Applications', count: applications.length },
    { id: 'saved', label: 'Saved Jobs', count: savedJobs.length },
    { id: 'postings', label: 'My Postings', count: myPostings.length },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue">My Jobs</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your applications, saved jobs, and postings</p>
        </div>
        <Button onClick={() => setShowPostModal(true)}>
          <Plus size={16} /> Post a Job
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          applications.length === 0 ? (
            <EmptyState icon={FileText} title="No applications yet" message="Browse jobs and apply to get started." action={<Link to="/dashboard/jobs"><Button size="sm">Browse Jobs</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <Link key={app.id} to={`/dashboard/jobs/${app.job_id}`} className="block bg-white rounded-xl border border-neutral-100 p-4 hover:border-brand-pink/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-dark-blue">{app.job_title}</h3>
                      <p className="text-sm text-neutral-600">{app.job_company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        {app.job_location && <span className="flex items-center gap-1"><MapPin size={12} />{app.job_location}</span>}
                        {app.job_type && <span className="flex items-center gap-1"><Clock size={12} />{app.job_type}</span>}
                        <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={statusColors[app.status] || 'gray'}>{app.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          savedJobs.length === 0 ? (
            <EmptyState icon={Bookmark} title="No saved jobs" message="Bookmark jobs you're interested in to find them here." action={<Link to="/dashboard/jobs"><Button size="sm">Browse Jobs</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {savedJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl border border-neutral-100 p-4 flex items-start justify-between">
                  <Link to={`/dashboard/jobs/${job.id}`} className="flex-1">
                    <h3 className="font-semibold text-dark-blue hover:text-brand-pink transition-colors">{job.title}</h3>
                    <p className="text-sm text-neutral-600">{job.company}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
                      {job.type && <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>}
                      {job.salary_range && <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary_range}</span>}
                    </div>
                  </Link>
                  <button onClick={() => unsaveJob(job.id)} className="text-neutral-400 hover:text-red-500 cursor-pointer ml-3">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* My Postings Tab */}
        {activeTab === 'postings' && (
          myPostings.length === 0 ? (
            <EmptyState icon={Briefcase} title="No job postings" message="Post a job to find qualified marketing professionals." action={<Button size="sm" onClick={() => setShowPostModal(true)}><Plus size={14} /> Post a Job</Button>} />
          ) : (
            <div className="space-y-3">
              {myPostings.map(job => (
                <div key={job.id} className="bg-white rounded-xl border border-neutral-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/dashboard/jobs/${job.id}`} className="font-semibold text-dark-blue hover:text-brand-pink transition-colors">
                        {job.title}
                      </Link>
                      <p className="text-sm text-neutral-600">{job.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-brand-blue">
                        <Users size={14} /> {job.applicant_count || 0} applicant{job.applicant_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Post Job Modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post a New Job" size="lg">
        <div className="space-y-4">
          <Input label="Job Title *" value={jobForm.title} onChange={(e) => setJobForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior Content Strategist" />
          <Input label="Company *" value={jobForm.company} onChange={(e) => setJobForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. TechFlow" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Location" value={jobForm.location} onChange={(e) => setJobForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Remote, New York, NY" />
            <Select label="Job Type" value={jobForm.type} onChange={(e) => setJobForm(p => ({ ...p, type: e.target.value }))} options={['full-time', 'contract', 'freelance']} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Category" value={jobForm.category} onChange={(e) => setJobForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Content, Growth, Brand" />
            <Input label="Salary Range" value={jobForm.salary_range} onChange={(e) => setJobForm(p => ({ ...p, salary_range: e.target.value }))} placeholder="e.g. $120k - $150k" />
          </div>
          <Textarea label="Description" value={jobForm.description} onChange={(e) => setJobForm(p => ({ ...p, description: e.target.value }))} rows={6} placeholder="Describe the role, responsibilities, and requirements..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPostModal(false)}>Cancel</Button>
            <Button onClick={postJob} disabled={posting || !jobForm.title || !jobForm.company}>
              {posting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
