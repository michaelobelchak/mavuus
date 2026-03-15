import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, ChevronLeft, ChevronRight, Trash2, Star, X } from 'lucide-react'

export default function AdminReviewsPage() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const limit = 20

  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchReviews = async () => {
    const params = new URLSearchParams({ page, limit })
    if (ratingFilter) params.set('rating', ratingFilter)
    if (typeFilter) params.set('type', typeFilter)
    try {
      const res = await fetch(`/api/admin/reviews?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchReviews() }, [page, ratingFilter, typeFilter, token])

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchReviews()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const typeBadge = (review) => {
    const isVendor = !!review.vendor_id
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${isVendor ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
        {isVendor ? 'Vendor' : 'Job'}
      </span>
    )
  }

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Review Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Types</option>
          <option value="vendor">Vendor</option>
          <option value="job">Job</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} reviews</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Reviewer</th>
              <th className="px-4 py-3 font-medium">Reviewee</th>
              <th className="px-4 py-3 font-medium">Vendor / Job</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3">{typeBadge(review)}</td>
                <td className="px-4 py-3 text-neutral-600">{review.reviewer_name}</td>
                <td className="px-4 py-3 text-neutral-600">{review.reviewee_name}</td>
                <td className="px-4 py-3 text-neutral-600 max-w-[150px] truncate">{review.vendor_name || review.job_title || '-'}</td>
                <td className="px-4 py-3">{renderStars(review.rating)}</td>
                <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate">
                  {review.text?.length > 80 ? review.text.slice(0, 80) + '...' : review.text}
                </td>
                <td className="px-4 py-3 text-neutral-500">{new Date(review.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteConfirm(review)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Review</h3>
            <p className="text-sm text-neutral-500 mb-2">Are you sure you want to delete this review? This action cannot be undone.</p>
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
              {deleteConfirm.vendor_id
                ? 'Deleting this review will trigger a recalculation of the vendor\'s average rating.'
                : 'This will permanently remove the review.'}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-neutral-500">Rating:</span>
              {renderStars(deleteConfirm.rating)}
            </div>
            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3 mb-4 line-clamp-3">{deleteConfirm.text}</p>
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
