import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const emptyForm = {
  title: '',
  description: '',
  content: '',
  author: '',
  type: 'article',
  category_id: '',
  read_time: '',
  url: '',
  thumbnail_url: '',
  status: 'published',
}

export default function AdminResourcesPage() {
  const { token } = useAuth()
  const [resources, setResources] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [deleteId, setDeleteId] = useState(null)

  const fetchResources = async () => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/resources?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setResources(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=resource', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || data || [])
      }
    } catch {}
  }

  useEffect(() => { fetchCategories() }, [token])
  useEffect(() => { fetchResources() }, [page, typeFilter, categoryFilter, statusFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchResources()
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (resource) => {
    setEditingId(resource.id)
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      content: resource.content || '',
      author: resource.author || '',
      type: resource.type || 'article',
      category_id: resource.category_id || '',
      read_time: resource.read_time || '',
      url: resource.url || '',
      thumbnail_url: resource.thumbnail_url || '',
      status: resource.status || 'published',
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
    const url = editingId ? `/api/admin/resources/${editingId}` : '/api/admin/resources'
    const method = editingId ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        closeModal()
        fetchResources()
      }
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/resources/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteId(null)
        fetchResources()
      }
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const typeBadge = (type) => {
    const styles = {
      article: 'bg-blue-50 text-blue-600',
      guide: 'bg-purple-50 text-purple-600',
      template: 'bg-amber-50 text-amber-600',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[type] || 'bg-neutral-100 text-neutral-500'}`}>{type}</span>
  }

  const statusBadge = (status) => {
    const styles = {
      draft: 'bg-amber-50 text-amber-600',
      published: 'bg-green-50 text-green-600',
      archived: 'bg-neutral-100 text-neutral-500',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || 'bg-neutral-100 text-neutral-500'}`}>{status || 'published'}</span>
  }

  const categoryName = (catId) => {
    const cat = categories.find(c => c.id === catId)
    return cat ? cat.name : '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Resource Management</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-pink text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer">
          <Plus size={16} />
          Add New Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Types</option>
          <option value="article">Article</option>
          <option value="guide">Guide</option>
          <option value="template">Template</option>
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} resources</p>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {resources.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-dark-blue text-sm leading-snug">{r.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(r)} className="text-neutral-400 hover:text-brand-pink cursor-pointer" title="Edit">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => setDeleteId(r.id)} className="text-neutral-400 hover:text-red-500 cursor-pointer" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {r.author && <p className="text-xs text-neutral-500">by {r.author}</p>}
            <div className="flex flex-wrap items-center gap-2">
              {typeBadge(r.type)}
              {statusBadge(r.status)}
              <span className="text-xs text-neutral-500">{categoryName(r.category_id)}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              {r.read_time && <span>{r.read_time} min read</span>}
              <span>{r.bookmark_count ?? 0} bookmarks</span>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-100 p-8 text-center text-neutral-400 text-sm">No resources found.</div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Read Time</th>
              <th className="px-4 py-3 font-medium">Bookmarks</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-dark-blue max-w-xs truncate">{r.title}</td>
                <td className="px-4 py-3 text-neutral-600">{r.author || '—'}</td>
                <td className="px-4 py-3">{typeBadge(r.type)}</td>
                <td className="px-4 py-3 text-neutral-600">{categoryName(r.category_id)}</td>
                <td className="px-4 py-3 text-neutral-500">{r.read_time ? `${r.read_time} min` : '—'}</td>
                <td className="px-4 py-3 text-neutral-500">{r.bookmark_count ?? 0}</td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="text-neutral-400 hover:text-brand-pink cursor-pointer" title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteId(r.id)} className="text-neutral-400 hover:text-red-500 cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400">No resources found.</td></tr>
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
              <h2 className="text-lg font-bold text-dark-blue">{editingId ? 'Edit Resource' : 'Create Resource'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Content</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={8} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
                  <input name="author" value={formData.author} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Read Time (minutes)</label>
                  <input type="number" name="read_time" value={formData.read_time} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                    <option value="article">Article</option>
                    <option value="guide">Guide</option>
                    <option value="template">Template</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL</label>
                <input name="url" value={formData.url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Thumbnail URL</label>
                <input name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="text-sm px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">Cancel</button>
                <button type="submit" className="text-sm px-4 py-2 bg-brand-pink text-white rounded-lg hover:opacity-90 cursor-pointer">{editingId ? 'Save Changes' : 'Create Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-dark-blue mb-2">Delete Resource</h3>
            <p className="text-sm text-neutral-500 mb-6">Are you sure you want to delete this resource? This action cannot be undone.</p>
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
