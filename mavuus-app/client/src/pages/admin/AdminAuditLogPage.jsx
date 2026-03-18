import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Shield, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Filter, Calendar } from 'lucide-react'

const ENTITY_TYPES = ['', 'user', 'job', 'session', 'vendor', 'setting', 'notification', 'resource', 'testimonial']

const ENTITY_BADGE_COLORS = {
  user: 'bg-blue-50 text-blue-600',
  job: 'bg-green-50 text-green-600',
  session: 'bg-purple-50 text-purple-600',
  vendor: 'bg-amber-50 text-amber-600',
  setting: 'bg-neutral-100 text-neutral-600',
  notification: 'bg-pink-50 text-pink-600',
  resource: 'bg-teal-50 text-teal-600',
  testimonial: 'bg-indigo-50 text-indigo-600',
}

export default function AdminAuditLogPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState(null)
  const [entityType, setEntityType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const limit = 20

  const fetchLogs = () => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (entityType) params.set('entity_type', entityType)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    fetch(`/api/admin/audit-logs?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setLogs(data.data || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [token, page])

  const handleFilter = () => {
    setPage(1)
    fetchLogs()
  }

  const handleClearFilters = () => {
    setEntityType('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    setTimeout(fetchLogs, 0)
  }

  const totalPages = Math.ceil(total / limit)

  const formatDetails = (details) => {
    if (!details) return '-'
    if (typeof details === 'string') {
      try {
        return JSON.stringify(JSON.parse(details), null, 2)
      } catch {
        return details
      }
    }
    return JSON.stringify(details, null, 2)
  }

  const previewDetails = (details) => {
    if (!details) return '-'
    const str = typeof details === 'string' ? details : JSON.stringify(details)
    return str.length > 60 ? str.slice(0, 60) + '...' : str
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield size={24} className="text-brand-pink" />
        <h1 className="text-2xl font-bold text-dark-blue">Audit Log</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-neutral-500" />
          <h2 className="text-sm font-semibold text-dark-blue">Filters</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Entity Type</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink bg-white"
            >
              <option value="">All Types</option>
              {ENTITY_TYPES.filter(Boolean).map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">From</label>
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
            />
          </div>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 transition-colors cursor-pointer"
          >
            Apply
          </button>
          {(entityType || dateFrom || dateTo) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">No audit log entries found</div>
        ) : (
          logs.map(log => {
            const badgeColor = ENTITY_BADGE_COLORS[log.entity_type] || 'bg-neutral-100 text-neutral-500'
            const isExpanded = expandedRow === log.id
            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-neutral-100 p-4 cursor-pointer"
                onClick={() => setExpandedRow(isExpanded ? null : log.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-dark-blue text-sm">{log.admin_name || log.admin_email || '-'}</span>
                  {log.entity_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {log.entity_type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-dark-blue mb-1">{log.action || '-'}</p>
                <p className="text-xs text-neutral-400 mb-2">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                </p>
                <p className="text-xs text-neutral-400 truncate">{previewDetails(log.details)}</p>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-xs font-medium text-neutral-500 mb-2">Full Details</p>
                    <pre className="text-xs text-dark-blue bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                      {formatDetails(log.details)}
                    </pre>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium w-8" />
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity Type</th>
                <th className="px-4 py-3 font-medium">Entity ID</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                    No audit log entries found
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const isExpanded = expandedRow === log.id
                  const badgeColor = ENTITY_BADGE_COLORS[log.entity_type] || 'bg-neutral-100 text-neutral-500'
                  return (
                    <tbody key={log.id}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-neutral-400">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-dark-blue">
                          {log.admin_name || log.admin_email || '-'}
                        </td>
                        <td className="px-4 py-3 text-dark-blue">{log.action || '-'}</td>
                        <td className="px-4 py-3">
                          {log.entity_type ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {log.entity_type}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 font-mono text-xs">
                          {log.entity_id || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-xs truncate max-w-xs">
                          {previewDetails(log.details)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-neutral-50">
                          <td colSpan={7} className="px-6 py-4">
                            <p className="text-xs font-medium text-neutral-500 mb-2">Full Details</p>
                            <pre className="text-xs text-dark-blue bg-white border border-neutral-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                              {formatDetails(log.details)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
  )
}
