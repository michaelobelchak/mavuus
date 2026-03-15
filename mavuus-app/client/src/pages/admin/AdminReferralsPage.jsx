import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Gift, TrendingUp, Calendar, Crown, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminReferralsPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 15

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/referrals/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    fetch(`/api/admin/referrals?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setReferrals(data.data || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, page])

  const totalPages = Math.ceil(total / limit)

  const statCards = stats
    ? [
        {
          label: 'Total Referrals',
          value: stats.totalReferrals ?? 0,
          icon: Gift,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'This Month',
          value: stats.thisMonth ?? 0,
          icon: Calendar,
          color: 'bg-green-50 text-green-600',
        },
        {
          label: 'This Week',
          value: stats.thisWeek ?? 0,
          icon: TrendingUp,
          color: 'bg-purple-50 text-purple-600',
        },
        {
          label: 'Top Referrer',
          value: stats.topReferrer?.name || '-',
          badge: stats.topReferrer?.count ? `${stats.topReferrer.count} referrals` : null,
          icon: Crown,
          color: 'bg-amber-50 text-amber-600',
        },
      ]
    : []

  if (loading && !referrals.length) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Referrals</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-xl border border-neutral-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  {card.badge && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-dark-blue">{card.value}</p>
                <p className="text-sm text-neutral-500">{card.label}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Referrals Table */}
      <div>
        <h2 className="text-lg font-semibold text-dark-blue mb-4">All Referrals</h2>
        <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">Referred User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    No referrals found
                  </td>
                </tr>
              ) : (
                referrals.map(r => (
                  <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark-blue">{r.referrer_name || '-'}</p>
                      <p className="text-xs text-neutral-400">{r.referrer_email || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark-blue">{r.referred_name || '-'}</p>
                      <p className="text-xs text-neutral-400">{r.referred_email || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === 'completed'
                            ? 'bg-green-50 text-green-600'
                            : r.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {r.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
