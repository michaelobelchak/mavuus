import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, RotateCcw, FileText, X, Download, StickyNote } from 'lucide-react'

export default function AdminJobsPage() {
  const { token } = useAuth()
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [moderationFilter, setModerationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  // Modal state
  const [applicantsModal, setApplicantsModal] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [notesModal, setNotesModal] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchJobs = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (moderationFilter) params.set('moderation_status', moderationFilter)
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/jobs?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setJobs(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchJobs() }, [page, typeFilter, moderationFilter, statusFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const fetchApplicants = async (jobId) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/applications`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setApplicants(data.data || [])
      }
    } catch {}
  }

  const openApplicantsModal = (job) => {
    setApplicantsModal(job)
    fetchApplicants(job.id)
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await fetch(`/api/admin/jobs/applications/${applicationId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (applicantsModal) fetchApplicants(applicantsModal.id)
    } catch {}
  }

  const updateModeration = async (jobId, moderation_status) => {
    try {
      await fetch(`/api/admin/jobs/${jobId}/moderation`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderation_status }),
      })
      fetchJobs()
    } catch {}
  }

  const updateJobStatus = async (jobId, status) => {
    try {
      await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchJobs()
    } catch {}
  }

  const saveAdminNotes = async () => {
    if (!notesModal) return
    try {
      await fetch(`/api/admin/jobs/${notesModal.id}/notes`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })
      setNotesModal(null)
      fetchJobs()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const moderationBadge = (status) => {
    const colors = {
      approved: 'bg-green-50 text-green-600',
      hidden: 'bg-amber-50 text-amber-600',
      removed: 'bg-red-50 text-red-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
  }

  const statusBadge = (status) => {
    const colors = {
      open: 'bg-green-50 text-green-600',
      'in-progress': 'bg-blue-50 text-blue-600',
      completed: 'bg-purple-50 text-purple-600',
      closed: 'bg-neutral-100 text-neutral-500',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
  }

  const renderActionButtons = (job) => (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => openApplicantsModal(job)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
        <FileText size={12} /> Applications
      </button>
      {job.moderation_status !== 'hidden' && (
        <button onClick={() => updateModeration(job.id, 'hidden')} className="text-xs text-amber-600 hover:underline cursor-pointer flex items-center gap-1">
          <EyeOff size={12} /> Hide
        </button>
      )}
      {job.moderation_status === 'hidden' && (
        <button onClick={() => updateModeration(job.id, 'approved')} className="text-xs text-green-600 hover:underline cursor-pointer flex items-center gap-1">
          <RotateCcw size={12} /> Restore
        </button>
      )}
      {job.moderation_status !== 'removed' && (
        <button onClick={() => updateModeration(job.id, 'removed')} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
          <Trash2 size={12} /> Remove
        </button>
      )}
      <button onClick={() => { setNotesModal(job); setAdminNotes(job.admin_notes || '') }} className="text-xs text-neutral-500 hover:underline cursor-pointer flex items-center gap-1">
        <StickyNote size={12} /> Notes
      </button>
    </div>
  )

  const renderStatusSelect = (job) => (
    <select
      value={job.status || 'open'}
      onChange={e => updateJobStatus(job.id, e.target.value)}
      className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer bg-white"
    >
      <option value="open">Open</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="closed">Closed</option>
    </select>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Job Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Types</option>
          <option value="full-time">Full-Time</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
        </select>
        <select value={moderationFilter} onChange={e => { setModerationFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Moderation</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
          <option value="removed">Removed</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} jobs</p>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-dark-blue text-sm truncate">{job.title}</h3>
                <p className="text-xs text-neutral-500">{job.company}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {statusBadge(job.status || 'open')}
                {moderationBadge(job.moderation_status)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>By {job.posted_by_name}</span>
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
              <span>{job.applicant_count || 0} applicants</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500">Status:</span>
              {renderStatusSelect(job)}
            </div>
            {renderActionButtons(job)}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Posted By</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Applicants</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Moderation</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-dark-blue max-w-[200px] truncate">{job.title}</td>
                <td className="px-4 py-3 text-neutral-600">{job.company}</td>
                <td className="px-4 py-3 text-neutral-600">{job.posted_by_name}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(job.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-neutral-600">{job.applicant_count || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {statusBadge(job.status || 'open')}
                    {renderStatusSelect(job)}
                  </div>
                </td>
                <td className="px-4 py-3">{moderationBadge(job.moderation_status)}</td>
                <td className="px-4 py-3">
                  {renderActionButtons(job)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Applications Modal */}
      {applicantsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setApplicantsModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-blue">Applications for {applicantsModal.title}</h3>
              <button onClick={() => setApplicantsModal(null)} className="p-1 hover:bg-neutral-100 rounded cursor-pointer"><X size={18} /></button>
            </div>
            {applicants.length === 0 ? (
              <p className="text-sm text-neutral-400">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {applicants.map(app => (
                  <div key={app.id} className="border border-neutral-100 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-blue text-sm">{app.name}</p>
                      <p className="text-xs text-neutral-400">{app.email}</p>
                    </div>
                    <select
                      value={app.status}
                      onChange={e => updateApplicationStatus(app.id, e.target.value)}
                      className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer"
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                    {app.resume_url && (
                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-pink hover:underline flex items-center gap-1">
                        <Download size={12} /> Resume
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setNotesModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-4">Admin Notes - {notesModal.title}</h3>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Add admin notes..."
              className="w-full border border-neutral-200 rounded-lg p-3 text-sm h-32 mb-4 focus:outline-none focus:border-brand-pink"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setNotesModal(null)} className="px-4 py-2 text-sm text-neutral-500 cursor-pointer">Cancel</button>
              <button onClick={saveAdminNotes} className="px-4 py-2 text-sm bg-brand-pink text-white rounded-lg cursor-pointer hover:bg-brand-pink/90">Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
