import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Download, Users, Briefcase, Store, BarChart3, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'

const EXPORT_CARDS = [
  {
    key: 'users',
    title: 'Users',
    description: 'Export all user accounts including name, email, membership tier, join date, and profile details.',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    endpoint: '/api/admin/export/users',
    filename: 'mavuus-users.csv',
  },
  {
    key: 'jobs',
    title: 'Jobs',
    description: 'Export all job listings with title, company, location, salary range, status, and posting dates.',
    icon: Briefcase,
    color: 'bg-green-50 text-green-600',
    endpoint: '/api/admin/export/jobs',
    filename: 'mavuus-jobs.csv',
  },
  {
    key: 'vendors',
    title: 'Vendors',
    description: 'Export vendor directory including company name, contact info, categories, and ratings.',
    icon: Store,
    color: 'bg-amber-50 text-amber-600',
    endpoint: '/api/admin/export/vendors',
    filename: 'mavuus-vendors.csv',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Export platform analytics data including signups, engagement metrics, and activity trends.',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    endpoint: '/api/admin/export/analytics',
    filename: 'mavuus-analytics.csv',
  },
]

export default function AdminExportsPage() {
  const { token } = useAuth()
  const [downloading, setDownloading] = useState({})
  const [status, setStatus] = useState({})

  const handleDownload = async (card) => {
    setDownloading(prev => ({ ...prev, [card.key]: true }))
    setStatus(prev => ({ ...prev, [card.key]: null }))

    try {
      const res = await fetch(`${card.endpoint}?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Export failed (${res.status})`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = card.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setStatus(prev => ({ ...prev, [card.key]: { type: 'success', message: 'Downloaded successfully' } }))
      setTimeout(() => setStatus(prev => ({ ...prev, [card.key]: null })), 3000)
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        [card.key]: { type: 'error', message: err.message || 'Download failed' },
      }))
    } finally {
      setDownloading(prev => ({ ...prev, [card.key]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet size={24} className="text-brand-pink" />
        <h1 className="text-2xl font-bold text-dark-blue">Data Exports</h1>
      </div>

      <p className="text-sm text-neutral-500">
        Download platform data as CSV files for reporting and analysis.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {EXPORT_CARDS.map(card => {
          const Icon = card.icon
          const isDownloading = downloading[card.key]
          const cardStatus = status[card.key]

          return (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-neutral-100 p-6 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-dark-blue">{card.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{card.description}</p>
                </div>
              </div>

              {cardStatus && (
                <div
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg mb-3 ${
                    cardStatus.type === 'success'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {cardStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {cardStatus.message}
                </div>
              )}

              <div className="mt-auto pt-2">
                <button
                  onClick={() => handleDownload(card)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 transition-colors disabled:opacity-50 cursor-pointer w-full justify-center"
                >
                  {isDownloading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
