import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, ChevronLeft, ChevronRight, Eye, Trash2, X } from 'lucide-react'

export default function AdminCommentsPage() {
  const { token } = useAuth()
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const limit = 20

  const [viewModal, setViewModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchComments = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (entityTypeFilter) params.set('entity_type', entityTypeFilter)
    try {
      const res = await fetch(`/api/admin/comments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setComments(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchComments() }, [page, entityTypeFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchComments()
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchComments()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const entityBadge = (type) => {
    const colors = {
      job: 'bg-blue-50 text-blue-600',
      vendor: 'bg-purple-50 text-purple-600',
      post: 'bg-amber-50 text-amber-600',
      event: 'bg-green-50 text-green-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type] || 'bg-neutral-100 text-neutral-500'}`}>{type}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Comment Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search comments..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={entityTypeFilter} onChange={e => { setEntityTypeFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Types</option>
          <option value="job">Job</option>
          <option value="vendor">Vendor</option>
          <option value="post">Post</option>
          <option value="event">Event</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} comments</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <span className="font-medium text-dark-blue text-sm">{comment.author_name}</span>
              {entityBadge(comment.entity_type)}
            </div>
            <p className="text-xs text-neutral-600 line-clamp-2">
              {comment.content?.length > 100 ? comment.content.slice(0, 100) + '...' : comment.content}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
              <span className="text-xs text-neutral-400">{new Date(comment.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewModal(comment)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                  <Eye size={12} /> View
                </button>
                <button onClick={() => setDeleteConfirm(comment)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No comments found.</p>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(comment => (
              <tr key={comment.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-600 max-w-[300px] truncate">
                  {comment.content?.length > 100 ? comment.content.slice(0, 100) + '...' : comment.content}
                </td>
                <td className="px-4 py-3 text-neutral-600">{comment.author_name}</td>
                <td className="px-4 py-3">{entityBadge(comment.entity_type)}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(comment.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewModal(comment)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => setDeleteConfirm(comment)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
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

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-blue">Comment Details</h3>
              <button onClick={() => setViewModal(null)} className="p-1 hover:bg-neutral-100 rounded cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Author</p>
                <p className="text-sm font-medium text-dark-blue">{viewModal.author_name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Type</p>
                {entityBadge(viewModal.entity_type)}
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Date</p>
                <p className="text-sm text-neutral-600">{new Date(viewModal.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Content</p>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{viewModal.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Comment</h3>
            <p className="text-sm text-neutral-500 mb-4">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3 mb-4 line-clamp-3">{deleteConfirm.content}</p>
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
