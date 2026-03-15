import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Send, Eye, Users, Crown, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminNotificationsPage() {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [target, setTarget] = useState('all')
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [broadcasts, setBroadcasts] = useState([])
  const [broadcastsTotal, setBroadcastsTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  const targetLabels = { all: 'All Users', pro: 'Pro Members', free: 'Free Members' }

  const fetchBroadcasts = async () => {
    try {
      const params = new URLSearchParams({ page, limit })
      const res = await fetch(`/api/admin/notifications/broadcasts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBroadcasts(data.data || [])
        setBroadcastsTotal(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => { fetchBroadcasts() }, [token, page])

  const estimatedUsers = target === 'all' ? 'all' : target === 'pro' ? 'Pro' : 'Free'

  const handleSend = async () => {
    setSending(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, link: link || undefined, target }),
      })
      if (res.ok) {
        const data = await res.json()
        setSuccessMsg(`Notification sent to ${data.recipientCount || estimatedUsers} users.`)
        setTitle('')
        setMessage('')
        setLink('')
        setTarget('all')
        setPage(1)
        fetchBroadcasts()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to send notification')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setSending(false)
      setConfirmOpen(false)
    }
  }

  const totalPages = Math.ceil(broadcastsTotal / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <div className="bg-white rounded-xl border border-neutral-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={20} className="text-brand-pink" />
            <h2 className="text-lg font-semibold text-dark-blue">Send New Notification</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Notification title..."
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your notification message..."
                rows={4}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-1">Link (optional)</label>
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">Target Audience</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'All Users', icon: Users },
                  { value: 'pro', label: 'Pro Members', icon: Crown },
                  { value: 'free', label: 'Free Members', icon: UserCheck },
                ].map(opt => {
                  const Icon = opt.icon
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        target === opt.value
                          ? 'border-brand-pink bg-brand-pink/5 text-brand-pink'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        value={opt.value}
                        checked={target === opt.value}
                        onChange={e => setTarget(e.target.value)}
                        className="sr-only"
                      />
                      <Icon size={16} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {successMsg && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</div>
            )}
            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</div>
            )}

            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!title.trim() || !message.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={16} />
                Send to {targetLabels[target]}
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 flex-1">
                  Are you sure you want to send this notification to <strong>{targetLabels[target]}</strong>?
                </p>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-1.5 bg-brand-pink text-white rounded-lg text-sm font-medium hover:bg-brand-pink/90 disabled:opacity-50 cursor-pointer"
                >
                  {sending ? 'Sending...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-1.5 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-neutral-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye size={20} className="text-brand-pink" />
            <h2 className="text-lg font-semibold text-dark-blue">Preview</h2>
          </div>

          <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50">
            {title || message ? (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center flex-shrink-0">
                    <Bell size={18} className="text-brand-pink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark-blue">{title || 'Notification title'}</p>
                    <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">{message || 'Notification message will appear here...'}</p>
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-pink hover:underline mt-2 inline-block">
                        {link}
                      </a>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                        {targetLabels[target]}
                      </span>
                      <span className="text-xs text-neutral-400">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                <Bell size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Fill in the form to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast History */}
      {broadcasts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-dark-blue mb-4">Broadcast History</h2>
          <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Recipients</th>
                  <th className="px-4 py-3 font-medium">Sent At</th>
                  <th className="px-4 py-3 font-medium">Sent By</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map(b => (
                  <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark-blue">{b.title}</p>
                      <p className="text-xs text-neutral-400 truncate max-w-xs">{b.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {targetLabels[b.target] || b.target}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{b.recipient_count ?? '-'}</td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-neutral-500">{b.admin_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
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
      )}
    </div>
  )
}
