import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import { Users, Briefcase, Video, Store, Plus, Mail, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [growth, setGrowth] = useState([])
  const [activity, setActivity] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(r => r.json()),
      fetch('/api/admin/stats/growth', { headers }).then(r => r.json()),
      fetch('/api/admin/stats/activity', { headers }).then(r => r.json()),
      fetch('/api/admin/users?limit=10&sort=newest', { headers }).then(r => r.json()),
    ]).then(([s, g, a, u]) => {
      setStats(s)
      setGrowth(g)
      setActivity(a)
      setRecentUsers(u.data || [])
    }).catch(() => {})
  }, [token])

  if (!stats) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, badge: `+${stats.newUsersThisWeek} this week`, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Jobs', value: stats.activeJobs, badge: `${stats.totalJobs} total`, icon: Briefcase, color: 'bg-green-50 text-green-600' },
    { label: 'Total Sessions', value: stats.totalSessions, icon: Video, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Vendors', value: stats.totalVendors, icon: Store, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-neutral-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={20} />
                </div>
                {card.badge && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{card.badge}</span>}
              </div>
              <p className="text-2xl font-bold text-dark-blue">{card.value}</p>
              <p className="text-sm text-neutral-500">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Growth chart placeholder + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-pink" />
            <h2 className="text-lg font-semibold text-dark-blue">Weekly Signups (12 weeks)</h2>
          </div>
          <div className="flex items-end gap-2 h-40">
            {growth.map((w, i) => {
              const maxCount = Math.max(...growth.map(g => g.count), 1)
              const height = (w.count / maxCount) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-400">{w.count}</span>
                  <div className="w-full bg-brand-pink/80 rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-[9px] text-neutral-400 truncate w-full text-center">{w.week?.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <h3 className="text-sm font-semibold text-dark-blue mb-3">Platform Stats</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Messages', stats.totalMessages],
              ['Connections', stats.totalConnections],
              ['Comments', stats.totalComments],
              ['Reviews', stats.totalReviews],
              ['Recommendations', stats.totalRecommendations],
              ['Referrals', stats.totalReferrals],
              ['Pending Contact', stats.pendingContactSubmissions],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-neutral-500">{label}</span>
                <span className="font-medium text-dark-blue">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent signups + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <Link key={u.id} to={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:bg-neutral-50 rounded-lg p-2 -mx-2 transition-colors">
                <Avatar src={u.avatar_url} name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-blue truncate">{u.name}</p>
                  <p className="text-xs text-neutral-400">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.membership_tier === 'pro' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {u.membership_tier}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-pink" />
            <h2 className="text-lg font-semibold text-dark-blue">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-pink mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-dark-blue"><span className="font-medium">{a.user_name}</span> {a.description}</p>
                  <p className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/sessions" className="flex items-center gap-2 px-4 py-2 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 transition-colors">
          <Plus size={16} /> Add Session
        </Link>
        <Link to="/admin/resources" className="flex items-center gap-2 px-4 py-2 bg-dark-blue text-white rounded-lg text-sm font-medium hover:bg-dark-blue/90 transition-colors">
          <Plus size={16} /> Add Resource
        </Link>
        <Link to="/admin/speakers" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
          <Plus size={16} /> Add Speaker
        </Link>
        <Link to="/admin/contact" className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-dark-blue rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
          <Mail size={16} /> View Contact Forms
        </Link>
      </div>
    </div>
  )
}
