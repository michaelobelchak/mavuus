import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ChevronLeft, ChevronRight, Eye, Trash2, X } from 'lucide-react'

export default function AdminRecommendationsPage() {
  const { token } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  const [viewModal, setViewModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchRecommendations = async () => {
    const params = new URLSearchParams({ page, limit })
    try {
      const res = await fetch(`/api/admin/recommendations?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchRecommendations() }, [page, token])

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/recommendations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchRecommendations()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Recommendation Management</h1>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} recommendations</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-dark-blue text-sm">{rec.recommender_name}</h3>
                <p className="text-xs text-neutral-500">for {rec.vendor_name}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 line-clamp-2">
              {rec.message?.length > 100 ? rec.message.slice(0, 100) + '...' : rec.message}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
              <span className="text-xs text-neutral-400">{new Date(rec.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewModal(rec)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                  <Eye size={12} /> View
                </button>
                <button onClick={() => setDeleteConfirm(rec)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {recommendations.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No recommendations found.</p>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Recommender</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(rec => (
              <tr key={rec.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-600">{rec.recommender_name}</td>
                <td className="px-4 py-3 text-neutral-600">{rec.vendor_name}</td>
                <td className="px-4 py-3 text-neutral-600 max-w-[300px] truncate">
                  {rec.message?.length > 100 ? rec.message.slice(0, 100) + '...' : rec.message}
                </td>
                <td className="px-4 py-3 text-neutral-500">{new Date(rec.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewModal(rec)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => setDeleteConfirm(rec)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
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
              <h3 className="text-lg font-bold text-dark-blue">Recommendation Details</h3>
              <button onClick={() => setViewModal(null)} className="p-1 hover:bg-neutral-100 rounded cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Recommender</p>
                <p className="text-sm font-medium text-dark-blue">{viewModal.recommender_name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Vendor</p>
                <p className="text-sm font-medium text-dark-blue">{viewModal.vendor_name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Date</p>
                <p className="text-sm text-neutral-600">{new Date(viewModal.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Message</p>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{viewModal.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Recommendation</h3>
            <p className="text-sm text-neutral-500 mb-4">Are you sure you want to delete this recommendation? This action cannot be undone.</p>
            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3 mb-4 line-clamp-3">{deleteConfirm.message}</p>
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
