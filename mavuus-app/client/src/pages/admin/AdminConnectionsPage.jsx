import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'

export default function AdminConnectionsPage() {
  const { token } = useAuth()
  const [connections, setConnections] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const limit = 20

  const fetchConnections = async () => {
    const params = new URLSearchParams({ page, limit })
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/connections?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setConnections(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchConnections() }, [page, statusFilter, token])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/connections/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchConnections()
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/connections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchConnections()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-600',
      accepted: 'bg-green-50 text-green-600',
      declined: 'bg-red-50 text-red-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Connection Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} connections</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {connections.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-dark-blue">{c.requester_name}</div>
              {statusBadge(c.status)}
            </div>
            <div className="text-xs text-neutral-500">
              <span className="text-neutral-400">→</span> {c.receiver_name}
            </div>
            <div className="text-xs text-neutral-400">
              {c.requester_email} → {c.receiver_email}
            </div>
            <div className="text-xs text-neutral-400">{new Date(c.created_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <select
                value={c.status}
                onChange={e => updateStatus(c.id, e.target.value)}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer flex-1"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
              <button onClick={() => setDeleteConfirm(c)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {connections.length === 0 && <p className="text-sm text-neutral-400 text-center py-8">No connections found.</p>}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Requester</th>
              <th className="px-4 py-3 font-medium">Receiver</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {connections.map(c => (
              <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-dark-blue">{c.requester_name}</p>
                    <p className="text-xs text-neutral-400">{c.requester_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-dark-blue">{c.receiver_name}</p>
                    <p className="text-xs text-neutral-400">{c.receiver_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    onChange={e => updateStatus(c.id, e.target.value)}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-neutral-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteConfirm(c)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {connections.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No connections found.</td></tr>
            )}
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Connection</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Remove the connection between <strong>{deleteConfirm.requester_name}</strong> and <strong>{deleteConfirm.receiver_name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500 cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
