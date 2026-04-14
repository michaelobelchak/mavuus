import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react'

const CATEGORY_TYPES = ['session', 'resource', 'job', 'vendor', 'article']

const emptyForm = {
  name: '',
  type: 'session',
  sort_order: 0,
}

export default function AdminCategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('session')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [token])

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, type: activeTab })
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name || '',
      type: item.type || 'session',
      sort_order: item.sort_order ?? 0,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem
        ? `/api/admin/categories/${editingItem.id}`
        : '/api/admin/categories'
      const method = editingItem ? 'PUT' : 'POST'
      const payload = editingItem
        ? { name: form.name, sort_order: form.sort_order }
        : { ...form, slug: slugify(form.name) }
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        closeModal()
        fetchCategories()
      }
    } catch {}
    setSaving(false)
  }

  const toggleActive = async (item) => {
    try {
      await fetch(`/api/admin/categories/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      setCategories((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_active: !c.is_active } : c))
      )
    } catch {}
  }

  const handleDelete = async (id) => {
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDeleteConfirm(null)
        fetchCategories()
      } else {
        const data = await res.json().catch(() => ({}))
        setDeleteError(
          data.error || data.message || 'Cannot delete this category. It may still be in use.'
        )
      }
    } catch {
      setDeleteError('Failed to delete category.')
    }
  }

  const filtered = categories.filter((c) => {
    const matchesTab = c.type === activeTab
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const typeBadge = (type) => {
    const styles = {
      session: 'bg-blue-50 text-blue-600',
      resource: 'bg-green-50 text-green-600',
      job: 'bg-purple-50 text-purple-600',
      vendor: 'bg-amber-50 text-amber-600',
      article: 'bg-pink-50 text-pink-600',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[type] || 'bg-neutral-100 text-neutral-500'}`}>
        {type}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Categories</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink text-white text-sm font-medium rounded-lg hover:bg-brand-pink/90 cursor-pointer"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {CATEGORY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize cursor-pointer transition-colors ${
              activeTab === type
                ? 'bg-white text-dark-blue shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 w-fit">
        <Search size={16} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm focus:outline-none w-64"
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center text-neutral-400 py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No categories found.</p>
        ) : (
          filtered.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-dark-blue text-sm">{cat.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {typeBadge(cat.type)}
                    <span className="text-xs text-neutral-400">Order: {cat.sort_order ?? 0}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-50">
                <button
                  onClick={() => toggleActive(cat)}
                  className="text-xs text-neutral-500 hover:underline cursor-pointer"
                >
                  {cat.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(cat)} className="text-xs text-brand-pink hover:underline font-medium cursor-pointer flex items-center gap-1">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => { setDeleteError(null); setDeleteConfirm(cat.id) }} className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No categories found.
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-dark-blue">{cat.name}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">{typeBadge(cat.type)}</td>
                  <td className="px-4 py-3 text-neutral-500">{cat.sort_order ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        cat.is_active ? 'bg-green-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          cat.is_active ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-neutral-400 hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteConfirm(cat.id)
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-dark-blue">
                {editingItem ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                />
                {!editingItem && form.name && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Slug: <span className="font-mono">{slugify(form.name)}</span>
                  </p>
                )}
              </div>
              {!editingItem && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                  >
                    {CATEGORY_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {editingItem && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <p className="text-sm text-neutral-500 capitalize">{form.type}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-pink text-white text-sm font-medium rounded-lg hover:bg-brand-pink/90 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-dark-blue">Delete Category</h3>
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete this category? It can only be deleted if it is not in use.
            </p>
            {deleteError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {deleteError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null)
                  setDeleteError(null)
                }}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
