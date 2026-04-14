import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react'

const FAQ_PAGES = ['general', 'contact', 'pricing', 'about']

const emptyForm = {
  question: '',
  answer: '',
  page: 'general',
  sort_order: 0,
}

export default function AdminFaqPage() {
  const { token } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faqs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.data || data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchFaqs()
  }, [token])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, page: activeTab })
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      question: item.question || '',
      answer: item.answer || '',
      page: item.page || 'general',
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
        ? `/api/admin/faqs/${editingItem.id}`
        : '/api/admin/faqs'
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
        fetchFaqs()
      }
    } catch {}
    setSaving(false)
  }

  const toggleActive = async (item) => {
    try {
      await fetch(`/api/admin/faqs/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      setFaqs((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_active: !f.is_active } : f))
      )
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteConfirm(null)
      fetchFaqs()
    } catch {}
  }

  const filtered = faqs.filter((f) => {
    const matchesTab = f.page === activeTab
    const matchesSearch =
      !search ||
      f.question?.toLowerCase().includes(search.toLowerCase()) ||
      f.answer?.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const pageBadge = (page) => {
    const styles = {
      general: 'bg-blue-50 text-blue-600',
      contact: 'bg-purple-50 text-purple-600',
      pricing: 'bg-green-50 text-green-600',
      about: 'bg-amber-50 text-amber-600',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[page] || 'bg-neutral-100 text-neutral-500'}`}>
        {page}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">FAQs</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink text-white text-sm font-medium rounded-lg hover:bg-brand-pink/90 cursor-pointer"
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {FAQ_PAGES.map((page) => (
          <button
            key={page}
            onClick={() => setActiveTab(page)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize cursor-pointer transition-colors ${
              activeTab === page
                ? 'bg-white text-dark-blue shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 w-fit">
        <Search size={16} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm focus:outline-none w-64"
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-neutral-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">No FAQs found.</div>
        ) : (
          filtered.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-neutral-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-dark-blue text-sm flex-1 mr-2">
                  {faq.question?.substring(0, 80)}
                  {faq.question?.length > 80 ? '...' : ''}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(faq)}
                    className="p-1.5 text-neutral-400 hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(faq.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                {faq.answer?.substring(0, 100)}
                {faq.answer?.length > 100 ? '...' : ''}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {pageBadge(faq.page)}
                <span className="text-xs text-neutral-400">Order: {faq.sort_order ?? 0}</span>
                <button
                  onClick={() => toggleActive(faq)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    faq.is_active ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      faq.is_active ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
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
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Answer</th>
              <th className="px-4 py-3 font-medium">Page</th>
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
                  No FAQs found.
                </td>
              </tr>
            ) : (
              filtered.map((faq) => (
                <tr key={faq.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-dark-blue max-w-xs truncate">
                    {faq.question?.substring(0, 60)}
                    {faq.question?.length > 60 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">
                    {faq.answer?.substring(0, 80)}
                    {faq.answer?.length > 80 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3">{pageBadge(faq.page)}</td>
                  <td className="px-4 py-3 text-neutral-500">{faq.sort_order ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(faq)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        faq.is_active ? 'bg-green-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          faq.is_active ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(faq)}
                        className="p-1.5 text-neutral-400 hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
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
                {editingItem ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Question</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  required
                  rows={5}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-y"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Page</label>
                  <select
                    value={form.page}
                    onChange={(e) => setForm({ ...form, page: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                  >
                    {FAQ_PAGES.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
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
            <h3 className="text-lg font-semibold text-dark-blue">Delete FAQ</h3>
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
