import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react'

const emptyForm = {
  name: '',
  logo_url: '',
  website_url: '',
  sort_order: 0,
}

export default function AdminBrandLogosPage() {
  const { token } = useAuth()
  const [logos, setLogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchLogos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/brand-logos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLogos(data.data || data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchLogos()
  }, [token])

  const openCreate = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name || '',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
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
        ? `/api/admin/brand-logos/${editingItem.id}`
        : '/api/admin/brand-logos'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        closeModal()
        fetchLogos()
      }
    } catch {}
    setSaving(false)
  }

  const toggleActive = async (item) => {
    try {
      await fetch(`/api/admin/brand-logos/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      setLogos((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, is_active: !l.is_active } : l))
      )
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/brand-logos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchLogos()
    } catch {}
  }

  const filtered = logos.filter(
    (l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Brand Logos</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink text-white text-sm font-medium rounded-lg hover:bg-brand-pink/90 cursor-pointer"
        >
          <Plus size={16} />
          Add Logo
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 w-fit">
        <Search size={16} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search logos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm focus:outline-none w-64"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-sm text-neutral-500">Loading logos...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-100 p-8 text-center text-neutral-500 text-sm">
          No brand logos found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((logo) => (
            <div
              key={logo.id}
              className="bg-white rounded-xl border border-neutral-100 p-4 flex flex-col items-center gap-3"
            >
              {/* Logo Image */}
              <div className="w-full h-20 flex items-center justify-center bg-neutral-50 rounded-lg overflow-hidden">
                {logo.logo_url ? (
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-400">No image</span>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-dark-blue text-center truncate w-full">
                {logo.name}
              </p>

              {/* Sort order */}
              <span className="text-xs text-neutral-400">Order: {logo.sort_order ?? 0}</span>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(logo)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    logo.is_active ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      logo.is_active ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-neutral-500">
                  {logo.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(logo)}
                  className="p-1.5 text-neutral-400 hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg cursor-pointer"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(logo.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-dark-blue">
                {editingItem ? 'Edit Brand Logo' : 'Add Brand Logo'}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                />
              </div>
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
            <h3 className="text-lg font-semibold text-dark-blue">Delete Brand Logo</h3>
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete this brand logo? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
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
