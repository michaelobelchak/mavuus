import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const emptyForm = {
  name: '',
  title: '',
  company: '',
  avatar_url: '',
  bio: '',
  linkedin_url: '',
}

export default function AdminSpeakersPage() {
  const { token } = useAuth()
  const [speakers, setSpeakers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 20

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [deleteId, setDeleteId] = useState(null)

  const fetchSpeakers = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/admin/speakers?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setSpeakers(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchSpeakers() }, [page, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchSpeakers()
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (speaker) => {
    setEditingId(speaker.id)
    setFormData({
      name: speaker.name || '',
      title: speaker.title || '',
      company: speaker.company || '',
      avatar_url: speaker.avatar_url || '',
      bio: speaker.bio || '',
      linkedin_url: speaker.linkedin_url || '',
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
    const url = editingId ? `/api/admin/speakers/${editingId}` : '/api/admin/speakers'
    const method = editingId ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        closeModal()
        fetchSpeakers()
      }
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/speakers/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteId(null)
        fetchSpeakers()
      }
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Speaker Management</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-pink text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer">
          <Plus size={16} />
          Add New Speaker
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search speakers..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
      </div>

      <p className="text-sm text-neutral-500">Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} speakers</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {speakers.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2">
            <div className="flex items-center gap-3">
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
                  {s.name ? s.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-dark-blue truncate">{s.name}</h3>
                {s.title && <p className="text-xs text-neutral-500 truncate">{s.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              {s.company && <span>{s.company}</span>}
              <span>{s.session_count ?? 0} sessions</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-50">
              <button onClick={() => openEdit(s)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => setDeleteId(s.id)} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {speakers.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No speakers found.</p>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Speaker</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Sessions</th>
              <th className="px-4 py-3 font-medium">LinkedIn</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {speakers.map(s => (
              <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
                        {s.name ? s.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="font-medium text-dark-blue">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{s.title || '—'}</td>
                <td className="px-4 py-3 text-neutral-600">{s.company || '—'}</td>
                <td className="px-4 py-3 text-neutral-500">{s.session_count ?? 0}</td>
                <td className="px-4 py-3">
                  {s.linkedin_url ? (
                    <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-pink hover:underline">View Profile</a>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
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
            {speakers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No speakers found.</td></tr>
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
              <h2 className="text-lg font-bold text-dark-blue">{editingId ? 'Edit Speaker' : 'Create Speaker'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} required className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input name="company" value={formData.company} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Avatar URL</label>
                  <input name="avatar_url" value={formData.avatar_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">LinkedIn URL</label>
                <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="text-sm px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">Cancel</button>
                <button type="submit" className="text-sm px-4 py-2 bg-brand-pink text-white rounded-lg hover:opacity-90 cursor-pointer">{editingId ? 'Save Changes' : 'Create Speaker'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Speaker</h3>
            <p className="text-sm text-neutral-500 mb-6">Are you sure you want to delete this speaker? This action cannot be undone.</p>
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
