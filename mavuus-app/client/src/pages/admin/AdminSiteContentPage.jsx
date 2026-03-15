import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Edit2, X, Check } from 'lucide-react'

const PAGES = ['homepage', 'about', 'pricing']

export default function AdminSiteContentPage() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('homepage')
  const [contentItems, setContentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/site-content', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setContentItems(data.data || data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchContent()
  }, [token])

  const pageItems = contentItems.filter((item) => item.page === activeTab)

  const groupedBySection = pageItems.reduce((acc, item) => {
    const section = item.section || 'General'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditValue(item.content || item.value || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveField = async (item) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/site-content/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editValue, value: editValue }),
      })
      if (res.ok) {
        setContentItems((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, content: editValue, value: editValue } : c
          )
        )
        setEditingId(null)
        setEditValue('')
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Site Content</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {PAGES.map((page) => (
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

      {loading ? (
        <div className="text-sm text-neutral-500">Loading content...</div>
      ) : Object.keys(groupedBySection).length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-100 p-8 text-center text-neutral-500 text-sm">
          No content found for this page.
        </div>
      ) : (
        Object.entries(groupedBySection).map(([section, items]) => (
          <div key={section} className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <h2 className="text-sm font-semibold text-dark-blue capitalize">{section}</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {item.key || item.field_name || item.label || 'Field'}
                      </label>
                      {editingId === item.id ? (
                        <div className="mt-2 space-y-3">
                          {(item.content || item.value || '').length > 100 || item.type === 'textarea' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={5}
                              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-y"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveField(item)}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-pink text-white text-xs font-medium rounded-lg hover:bg-brand-pink/90 disabled:opacity-50 cursor-pointer"
                            >
                              <Check size={14} />
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 cursor-pointer"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-dark-blue whitespace-pre-wrap">
                          {item.content || item.value || '(empty)'}
                        </p>
                      )}
                    </div>
                    {editingId !== item.id && (
                      <button
                        onClick={() => startEditing(item)}
                        className="mt-4 p-1.5 text-neutral-400 hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
