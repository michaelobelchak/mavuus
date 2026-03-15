import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const emptyForm = {
  title: '',
  description: '',
  speaker_name: '',
  speaker_title: '',
  speaker_avatar: '',
  type: 'live',
  category_id: '',
  scheduled_date: '',
  duration: '',
  video_url: '',
  thumbnail_url: '',
}

export default function AdminSessionsPage() {
  const { token } = useAuth()
  const [sessions, setSessions] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const limit = 20

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [deleteId, setDeleteId] = useState(null)

  const fetchSessions = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    try {
      const res = await fetch(`/api/admin/sessions?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=session', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || data || [])
      }
    } catch {}
  }

  useEffect(() => { fetchCategories() }, [token])
  useEffect(() => { fetchSessions() }, [page, typeFilter, categoryFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchSessions()
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (session) => {
    setEditingId(session.id)
    setFormData({
      title: session.title || '',
      description: session.description || '',
      speaker_name: session.speaker_name || '',
      speaker_title: session.speaker_title || '',
      speaker_avatar: session.speaker_avatar || '',
      type: session.type || 'live',
      category_id: session.category_id || '',
      scheduled_date: session.scheduled_date ? session.scheduled_date.slice(0, 16) : '',
      duration: session.duration || '',
      video_url: session.video_url || '',
      thumbnail_url: session.thumbnail_url || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ ...emptyForm })
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editingId ? `/api/admin/sessions/${editingId}` : '/api/admin/sessions'
    const method = editingId ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        closeModal()
        fetchSessions()
      }
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/sessions/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteId(null)
        fetchSessions()
      }
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const typeBadge = (type) => {
    const styles = {
      live: 'bg-green-50 text-green-600',
      'on-demand': 'bg-blue-50 text-blue-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[type] || 'bg-neutral-100 text-neutral-500'}`}>{type}</span>
  }

  const categoryName = (catId) => {
    const cat = categories.find(c => c.id === catId)
    return cat ? cat.name : '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Session Management</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-pink text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer">
          <Plus size={16} />
          Add New Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Types</option>
          <option value="live">Live</option>
          <option value="on-demand">On-Demand</option>
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} sessions</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Speaker</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-dark-blue max-w-xs truncate">{s.title}</td>
                <td className="px-4 py-3 text-neutral-600">{s.speaker_name || '—'}</td>
                <td className="px-4 py-3">{typeBadge(s.type)}</td>
                <td className="px-4 py-3 text-neutral-600">{categoryName(s.category_id)}</td>
                <td className="px-4 py-3 text-neutral-500">{s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-neutral-500">{s.views ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)} className="text-neutral-400 hover:text-brand-pink cursor-pointer" title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteId(s.id)} className="text-neutral-400 hover:text-red-500 cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No sessions found.</td></tr>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark-blue">{editingId ? 'Edit Session' : 'Create Session'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Speaker Name</label>
                  <input name="speaker_name" value={formData.speaker_name} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Speaker Title</label>
                  <input name="speaker_title" value={formData.speaker_title} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Speaker Avatar URL</label>
                <input name="speaker_avatar" value={formData.speaker_avatar} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                    <option value="live">Live</option>
                    <option value="on-demand">On-Demand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Scheduled Date</label>
                  <input type="datetime-local" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Duration (minutes)</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Video URL</label>
                <input name="video_url" value={formData.video_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Thumbnail URL</label>
                <input name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="text-sm px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">Cancel</button>
                <button type="submit" className="text-sm px-4 py-2 bg-brand-pink text-white rounded-lg hover:opacity-90 cursor-pointer">{editingId ? 'Save Changes' : 'Create Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Session</h3>
            <p className="text-sm text-neutral-500 mb-6">Are you sure you want to delete this session? This action cannot be undone.</p>
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
