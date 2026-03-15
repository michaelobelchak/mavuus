import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Settings, Globe, Share2, CreditCard, Server, Save, Check, AlertCircle } from 'lucide-react'

const SETTINGS_GROUPS = [
  {
    title: 'General',
    icon: Globe,
    color: 'bg-blue-50 text-blue-600',
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Mavuus' },
      { key: 'support_email', label: 'Support Email', type: 'email', placeholder: 'support@mavuus.com' },
    ],
  },
  {
    title: 'Social Media',
    icon: Share2,
    color: 'bg-purple-50 text-purple-600',
    fields: [
      { key: 'social_twitter', label: 'Twitter / X URL', type: 'text', placeholder: 'https://twitter.com/mavuus' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/mavuus' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/mavuus' },
    ],
  },
  {
    title: 'Membership',
    icon: CreditCard,
    color: 'bg-green-50 text-green-600',
    fields: [
      { key: 'membership_price_monthly', label: 'Monthly Price ($)', type: 'number', placeholder: '29' },
      { key: 'membership_price_yearly', label: 'Yearly Price ($)', type: 'number', placeholder: '249' },
    ],
  },
  {
    title: 'System',
    icon: Server,
    color: 'bg-amber-50 text-amber-600',
    fields: [
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
      { key: 'max_upload_size_mb', label: 'Max Upload Size (MB)', type: 'number', placeholder: '10' },
    ],
  },
]

export default function AdminSettingsPage() {
  const { token } = useAuth()
  const [values, setValues] = useState({})
  const [original, setOriginal] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const map = {}
        if (Array.isArray(data)) {
          data.forEach(s => {
            map[s.key] = s.value
          })
        } else if (data && typeof data === 'object') {
          Object.assign(map, data)
        }
        setValues(map)
        setOriginal(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }))
    setSaved(prev => ({ ...prev, [key]: false }))
    setErrors(prev => ({ ...prev, [key]: null }))
  }

  const handleSave = async (key) => {
    setSaving(prev => ({ ...prev, [key]: true }))
    setErrors(prev => ({ ...prev, [key]: null }))
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: values[key] }),
      })
      if (res.ok) {
        setOriginal(prev => ({ ...prev, [key]: values[key] }))
        setSaved(prev => ({ ...prev, [key]: true }))
        setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000)
      } else {
        const err = await res.json()
        setErrors(prev => ({ ...prev, [key]: err.error || 'Failed to save' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, [key]: 'Network error' }))
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={24} className="text-brand-pink" />
        <h1 className="text-2xl font-bold text-dark-blue">Settings</h1>
      </div>

      {SETTINGS_GROUPS.map(group => {
        const Icon = group.icon
        return (
          <div key={group.title} className="bg-white rounded-xl border border-neutral-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${group.color}`}>
                <Icon size={18} />
              </div>
              <h2 className="text-lg font-semibold text-dark-blue">{group.title}</h2>
            </div>

            <div className="space-y-4">
              {group.fields.map(field => {
                const isDirty = values[field.key] !== original[field.key]
                const isSaving = saving[field.key]
                const isSaved = saved[field.key]
                const error = errors[field.key]

                if (field.type === 'toggle') {
                  const isOn = values[field.key] === 'true' || values[field.key] === true
                  return (
                    <div key={field.key} className="flex items-center justify-between py-2">
                      <div>
                        <label className="text-sm font-medium text-dark-blue">{field.label}</label>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {isOn ? 'Site is in maintenance mode' : 'Site is live'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const newVal = !isOn
                            handleChange(field.key, newVal)
                          }}
                          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                            isOn ? 'bg-brand-pink' : 'bg-neutral-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                              isOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        {isDirty && (
                          <button
                            onClick={() => handleSave(field.key)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-pink text-white rounded-lg text-xs font-medium hover:bg-brand-pink/90 disabled:opacity-50 cursor-pointer"
                          >
                            {isSaving ? '...' : <><Save size={12} /> Save</>}
                          </button>
                        )}
                        {isSaved && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Check size={14} /> Saved
                          </span>
                        )}
                        {error && (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={14} /> {error}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-dark-blue mb-1">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={field.type}
                        value={values[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                      />
                      <button
                        onClick={() => handleSave(field.key)}
                        disabled={!isDirty || isSaving}
                        className="flex items-center gap-1 px-4 py-2 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        {isSaving ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isSaved ? (
                          <><Check size={14} /> Saved</>
                        ) : (
                          <><Save size={14} /> Save</>
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
