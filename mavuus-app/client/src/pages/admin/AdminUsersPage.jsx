import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const limit = 20

  const fetchUsers = async () => {
    const params = new URLSearchParams({ page, limit, sort })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    if (tierFilter) params.set('tier', tierFilter)
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchUsers() }, [page, sort, roleFilter, tierFilter, statusFilter, token])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleBan = async (id, isBanned) => {
    const endpoint = isBanned ? 'unban' : 'ban'
    const body = isBanned ? {} : { reason: 'Banned by admin' }
    try {
      await fetch(`/api/admin/users/${id}/${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchUsers()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  const statusBadge = (u) => {
    if (u.is_deleted) return <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">Deleted</span>
    if (u.is_banned) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">Banned</span>
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Active</span>
  }

  const roleBadge = (u) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-neutral-100 text-neutral-500'}`}>
      {u.role}
    </span>
  )

  const tierBadge = (u) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${u.membership_tier === 'pro' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-500'}`}>
      {u.membership_tier}
    </span>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">User Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-neutral-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm focus:outline-none w-48" />
        </form>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Tiers</option>
          <option value="pro">Pro</option>
          <option value="free">Free</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="deleted">Deleted</option>
        </select>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </div>

      <p className="text-sm text-neutral-500">Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} users</p>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-neutral-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={u.avatar_url} name={u.name} size="sm" />
                <div className="min-w-0">
                  <p className="font-medium text-dark-blue truncate">{u.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                </div>
              </div>
              {statusBadge(u)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {roleBadge(u)}
              {tierBadge(u)}
              <span className="text-xs text-neutral-400">Joined {new Date(u.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
              <Link to={`/admin/users/${u.id}`} className="text-brand-pink hover:underline text-xs font-medium">View</Link>
              <button
                onClick={() => handleBan(u.id, u.is_banned)}
                className={`text-xs font-medium cursor-pointer ${u.is_banned ? 'text-green-600 hover:underline' : 'text-red-500 hover:underline'}`}
              >
                {u.is_banned ? 'Unban' : 'Ban'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar_url} name={u.name} size="sm" />
                      <div>
                        <p className="font-medium text-dark-blue">{u.name}</p>
                        <p className="text-xs text-neutral-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(u)}</td>
                  <td className="px-4 py-3">{tierBadge(u)}</td>
                  <td className="px-4 py-3">{statusBadge(u)}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/users/${u.id}`} className="text-brand-pink hover:underline text-xs font-medium">View</Link>
                      <button
                        onClick={() => handleBan(u.id, u.is_banned)}
                        className={`text-xs font-medium cursor-pointer ${u.is_banned ? 'text-green-600 hover:underline' : 'text-red-500 hover:underline'}`}
                      >
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  )
}
