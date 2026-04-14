import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ChevronLeft, ChevronRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminContactPage() {
  const { token } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  const [expandedId, setExpandedId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

  const fetchSubmissions = async () => {
    const params = new URLSearchParams({ page, limit })
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/contact?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchSubmissions() }, [page, statusFilter, token])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchSubmissions()
    } catch {}
  }

  const toggleExpand = (submission) => {
    if (expandedId === submission.id) {
      setExpandedId(null)
    } else {
      setExpandedId(submission.id)
      setEditStatus(submission.status || 'new')
    }
  }

  const totalPages = Math.ceil(total / limit)

  const statusBadge = (status) => {
    const colors = {
      new: 'bg-blue-50 text-blue-600',
      'in-progress': 'bg-amber-50 text-amber-600',
      handled: 'bg-green-50 text-green-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Contact Submissions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="handled">Handled</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} submissions</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-dark-blue text-sm">{sub.name}</h3>
                <p className="text-xs text-neutral-500">{sub.email}</p>
              </div>
              <div className="ml-2 flex-shrink-0">{statusBadge(sub.status)}</div>
            </div>
            <p className="text-xs text-neutral-600 line-clamp-2">
              {sub.message?.length > 80 ? sub.message.slice(0, 80) + '...' : sub.message}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
              <span className="text-xs text-neutral-400">{new Date(sub.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <select
                  value={sub.status || 'new'}
                  onChange={e => updateStatus(sub.id, e.target.value)}
                  className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer"
                  onClick={e => e.stopPropagation()}
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="handled">Handled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No submissions found.</p>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <>
                <tr key={sub.id} className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer" onClick={() => toggleExpand(sub)}>
                  <td className="px-4 py-3 text-neutral-400">
                    {expandedId === sub.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{sub.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{sub.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{sub.phone || '-'}</td>
                  <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate">
                    {sub.message?.length > 80 ? sub.message.slice(0, 80) + '...' : sub.message}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {sub.status !== 'handled' && (
                      <button
                        onClick={() => updateStatus(sub.id, 'handled')}
                        className="text-xs text-green-600 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Mark Handled
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === sub.id && (
                  <tr key={`${sub.id}-expanded`} className="border-b border-neutral-50 bg-neutral-50/50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="space-y-4 max-w-2xl">
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Full Message</p>
                          <p className="text-sm text-neutral-700 whitespace-pre-wrap bg-white rounded-lg p-3 border border-neutral-100">{sub.message}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-neutral-400">Status:</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value)}
                            className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="handled">Handled</option>
                          </select>
                          <button
                            onClick={() => updateStatus(sub.id, editStatus)}
                            className="px-3 py-1 text-xs bg-brand-pink text-white rounded-lg cursor-pointer hover:bg-brand-pink/90"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Contact) */}
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
    </div>
  )
}
