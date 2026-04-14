import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'

const emptyForm = {
  company_name: '',
  company_description: '',
  website: '',
  logo_url: '',
  categories: '',
  moderation_status: 'pending',
  admin_notes: '',
}

export default function AdminVendorsPage() {
  const { token } = useAuth()
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  const [showModal, setShowModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [deleteId, setDeleteId] = useState(null)

  const fetchVendors = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/vendors?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setVendors(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=vendor', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || data || [])
      }
    } catch {}
  }

  useEffect(() => { fetchCategories() }, [token])
  useEffect(() => { fetchVendors() }, [page, categoryFilter, statusFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVendors()
  }

  const openEdit = (vendor) => {
    setEditingVendor(vendor)
    setFormData({
      company_name: vendor.company_name || '',
      company_description: vendor.company_description || '',
      website: vendor.website || '',
      logo_url: vendor.logo_url || '',
      categories: Array.isArray(vendor.categories) ? vendor.categories.join(', ') : (vendor.categories || ''),
      moderation_status: vendor.moderation_status || 'pending',
      admin_notes: vendor.admin_notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingVendor(null)
    setFormData({ ...emptyForm })
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editingVendor) return
    try {
      const res = await fetch(`/api/admin/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        closeModal()
        fetchVendors()
      }
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/vendors/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteId(null)
        fetchVendors()
      }
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const statusBadge = (status) => {
    const styles = {
      approved: 'bg-green-50 text-green-600',
      pending: 'bg-amber-50 text-amber-600',
      suspended: 'bg-red-50 text-red-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
  }

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0
    const full = Math.floor(r)
    const half = r - full >= 0.5
    const stars = []
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={14} className="fill-amber-400 text-amber-400" />)
      } else if (i === full && half) {
        stars.push(
          <span key={i} className="relative inline-block" style={{ width: 14, height: 14 }}>
            <Star size={14} className="text-neutral-200 absolute" />
            <span className="absolute overflow-hidden" style={{ width: '50%' }}>
              <Star size={14} className="fill-amber-400 text-amber-400" />
            </span>
          </span>
        )
      } else {
        stars.push(<Star key={i} size={14} className="text-neutral-200" />)
      }
    }
    return <div className="flex items-center gap-0.5">{stars}<span className="text-xs text-neutral-500 ml-1">{r.toFixed(1)}</span></div>
  }

  const displayCategories = (cats) => {
    if (!cats) return '—'
    const arr = Array.isArray(cats) ? cats : String(cats).split(',').map(c => c.trim()).filter(Boolean)
    if (arr.length === 0) return '—'
    return arr.slice(0, 3).map((c, i) => (
      <span key={i} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full mr-1">{c}</span>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Vendor Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} vendors</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {vendors.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-dark-blue truncate">{v.company_name}</h3>
                {v.company_description && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{v.company_description}</p>
                )}
              </div>
              <div className="ml-2 flex-shrink-0">{statusBadge(v.moderation_status || v.status)}</div>
            </div>
            <div className="flex items-center gap-3">
              {renderStars(v.rating)}
              <span className="text-xs text-neutral-500">{v.reviews_count ?? 0} reviews</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-50">
              <button onClick={() => openEdit(v)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => setDeleteId(v.id)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No vendors found.</p>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Reviews</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-dark-blue max-w-[200px] truncate">{v.company_name}</td>
                <td className="px-4 py-3">
                  {v.user_id ? (
                    <a href={`/admin/users/${v.user_id}`} className="text-brand-pink hover:underline text-xs font-medium">{v.user_name || v.user_email || `User #${v.user_id}`}</a>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">{displayCategories(v.categories)}</td>
                <td className="px-4 py-3">{renderStars(v.rating)}</td>
                <td className="px-4 py-3 text-neutral-500">{v.reviews_count ?? 0}</td>
                <td className="px-4 py-3">{statusBadge(v.moderation_status || v.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(v)} className="text-neutral-400 hover:text-brand-pink cursor-pointer" title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteId(v.id)} className="text-neutral-400 hover:text-red-500 cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No vendors found.</td></tr>
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

      {/* Edit Modal */}
      {showModal && editingVendor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark-blue">Edit Vendor</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                <input name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Description</label>
                <textarea name="company_description" value={formData.company_description} onChange={handleChange} rows={3} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
                  <input name="website" value={formData.website} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Logo URL</label>
                  <input name="logo_url" value={formData.logo_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categories (comma-separated)</label>
                <input name="categories" value={formData.categories} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" placeholder="e.g. Marketing, Analytics, CRM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Moderation Status</label>
                <select name="moderation_status" value={formData.moderation_status} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Notes</label>
                <textarea name="admin_notes" value={formData.admin_notes} onChange={handleChange} rows={3} placeholder="Internal notes about this vendor..." className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="text-sm px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">Cancel</button>
                <button type="submit" className="text-sm px-4 py-2 bg-brand-pink text-white rounded-lg hover:opacity-90 cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Vendor</h3>
            <p className="text-sm text-neutral-500 mb-6">Are you sure you want to delete this vendor? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="text-sm px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
