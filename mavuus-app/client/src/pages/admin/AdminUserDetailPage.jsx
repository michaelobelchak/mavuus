import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import { ArrowLeft, Shield, Ban, Trash2, RotateCcw, Star } from 'lucide-react'

const tabs = ['Profile', 'Experience', 'Connections', 'Activity', 'Messages', 'Account']

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Profile')
  const [loading, setLoading] = useState(true)
  const [banReason, setBanReason] = useState('')
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editTier, setEditTier] = useState('')

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setEditRole(data.user.role)
        setEditTier(data.user.membership_tier)
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchUser() }, [id, token])

  const updateUser = async (body) => {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchUser()
    } catch {}
  }

  const banUser = async () => {
    await fetch(`/api/admin/users/${id}/ban`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: banReason }),
    })
    setShowBanModal(false)
    setBanReason('')
    fetchUser()
  }

  const unbanUser = async () => {
    await fetch(`/api/admin/users/${id}/unban`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUser()
  }

  const softDelete = async () => {
    await fetch(`/api/admin/users/${id}/soft`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUser()
  }

  const restore = async () => {
    await fetch(`/api/admin/users/${id}/restore`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUser()
  }

  const permanentDelete = async () => {
    if (deleteConfirm !== 'DELETE') return
    await fetch(`/api/admin/users/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    })
    window.location.href = '/admin/users'
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <p className="text-center text-neutral-500 py-20">User not found</p>

  const u = user.user

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar src={u.avatar_url} name={u.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-dark-blue">{u.name}</h1>
            <p className="text-sm text-neutral-500">{u.email}</p>
            {u.title && <p className="text-sm text-neutral-400">{u.title}{u.company ? ` @ ${u.company}` : ''}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-neutral-100 text-neutral-500'}`}>{u.role}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${u.membership_tier === 'pro' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-500'}`}>{u.membership_tier}</span>
              {u.is_banned ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">Banned</span> : null}
              {u.is_deleted ? <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">Deleted</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={editRole} onChange={e => { setEditRole(e.target.value); updateUser({ role: e.target.value }) }} className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <select value={editTier} onChange={e => { setEditTier(e.target.value); updateUser({ membership_tier: e.target.value }) }} className="text-xs border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer">
              <option value="pro">Pro</option>
              <option value="free">Free</option>
            </select>
            {u.is_banned
              ? <button onClick={unbanUser} className="text-xs px-3 py-1 bg-green-50 text-green-600 rounded-lg cursor-pointer hover:bg-green-100">Unban</button>
              : <button onClick={() => setShowBanModal(true)} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100">Ban</button>
            }
            {u.is_deleted
              ? <button onClick={restore} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">Restore</button>
              : <button onClick={softDelete} className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-200">Soft Delete</button>
            }
            <button onClick={() => setShowDeleteModal(true)} className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700">Permanent Delete</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-100 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 transition-colors ${activeTab === tab ? 'border-brand-pink text-brand-pink' : 'border-transparent text-neutral-500 hover:text-dark-blue'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        {activeTab === 'Profile' && (
          <div className="space-y-4 text-sm">
            {user.profile ? (
              <>
                {user.profile.bio && <div><span className="font-medium text-neutral-500">Bio:</span> <p className="mt-1 text-dark-blue">{user.profile.bio}</p></div>}
                <div className="grid grid-cols-2 gap-4">
                  {[['Industry', user.profile.industry], ['Years Experience', user.profile.years_experience], ['Location', user.profile.location], ['Timezone', user.profile.timezone], ['LinkedIn', user.profile.linkedin_url], ['Website', user.profile.website_url], ['Visibility', user.profile.profile_visibility]].map(([l, v]) => v && (
                    <div key={l}><span className="font-medium text-neutral-500">{l}:</span> <span className="text-dark-blue ml-1">{v}</span></div>
                  ))}
                </div>
                {user.skills?.length > 0 && (
                  <div>
                    <span className="font-medium text-neutral-500">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">{user.skills.map((s, i) => <span key={i} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{s.skill}</span>)}</div>
                  </div>
                )}
              </>
            ) : <p className="text-neutral-400">No profile data</p>}
          </div>
        )}

        {activeTab === 'Experience' && (
          <div className="space-y-4">
            {user.experience?.length > 0 ? user.experience.map(exp => (
              <div key={exp.id} className="border border-neutral-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-blue">{exp.title}</p>
                    <p className="text-sm text-neutral-500">{exp.company}</p>
                  </div>
                  {exp.is_current ? <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Current</span> : null}
                </div>
                <p className="text-xs text-neutral-400 mt-1">{exp.start_date} — {exp.end_date || 'Present'}</p>
                {exp.description && <p className="text-sm text-neutral-600 mt-2">{exp.description}</p>}
              </div>
            )) : <p className="text-neutral-400 text-sm">No experience data</p>}
          </div>
        )}

        {activeTab === 'Connections' && (
          <div>
            <p className="text-sm text-neutral-500 mb-3">{user.connections?.length || 0} connections</p>
            <div className="space-y-2">
              {user.connections?.map(c => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <Avatar src={c.avatar_url} name={c.name} size="sm" />
                  <div className="flex-1"><p className="font-medium text-dark-blue">{c.name}</p><p className="text-xs text-neutral-400">{c.title}</p></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="space-y-6 text-sm">
            {user.jobs_posted?.length > 0 && (
              <div><h3 className="font-semibold text-dark-blue mb-2">Jobs Posted ({user.jobs_posted.length})</h3>
                {user.jobs_posted.map(j => <div key={j.id} className="flex justify-between py-1 border-b border-neutral-50"><span>{j.title}</span><span className="text-neutral-400">{j.applicant_count} applicants</span></div>)}
              </div>
            )}
            {user.job_applications?.length > 0 && (
              <div><h3 className="font-semibold text-dark-blue mb-2">Job Applications ({user.job_applications.length})</h3>
                {user.job_applications.map(a => <div key={a.id} className="flex justify-between py-1 border-b border-neutral-50"><span>{a.title}</span><span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'hired' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>{a.status}</span></div>)}
              </div>
            )}
            {user.reviews_given?.length > 0 && (
              <div><h3 className="font-semibold text-dark-blue mb-2">Reviews Given ({user.reviews_given.length})</h3>
                {user.reviews_given.map(r => <div key={r.id} className="py-1 border-b border-neutral-50"><div className="flex items-center gap-1">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}</div><p className="text-neutral-600 mt-1">{r.text?.slice(0, 100)}</p></div>)}
              </div>
            )}
            {user.comments_made?.length > 0 && (
              <div><h3 className="font-semibold text-dark-blue mb-2">Comments ({user.comments_made.length})</h3>
                {user.comments_made.map(c => <div key={c.id} className="flex justify-between py-1 border-b border-neutral-50"><span className="truncate flex-1">{c.content?.slice(0, 80)}</span><span className="text-xs text-neutral-400 ml-2">{c.entity_type}</span></div>)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Messages' && (
          <div>
            <p className="text-xs text-neutral-400 mb-3 italic">Message content is private — only metadata shown.</p>
            <p className="text-sm text-neutral-500">{user.conversations?.length || 0} conversations</p>
            <div className="space-y-2 mt-3">
              {user.conversations?.map(c => (
                <div key={c.conversation_id} className="flex items-center justify-between text-sm border-b border-neutral-50 py-2">
                  <span className="text-dark-blue">{c.participant_names}</span>
                  <div className="text-right">
                    <span className="text-neutral-400">{c.message_count} messages</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Account' && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-medium text-neutral-500">Created:</span> <span className="ml-1">{new Date(u.created_at).toLocaleString()}</span></div>
              <div><span className="font-medium text-neutral-500">Last Login:</span> <span className="ml-1">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</span></div>
              <div><span className="font-medium text-neutral-500">Email Verified:</span> <span className="ml-1">{u.email_verified ? 'Yes' : 'No'}</span></div>
            </div>
            {u.is_banned && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-medium text-red-600">Banned</p>
                {u.ban_reason && <p className="text-red-500 mt-1">Reason: {u.ban_reason}</p>}
                {u.banned_at && <p className="text-red-400 text-xs mt-1">Since: {new Date(u.banned_at).toLocaleString()}</p>}
              </div>
            )}
            {user.referral_info && (
              <div>
                <h3 className="font-semibold text-dark-blue mb-2">Referral Info</h3>
                {user.referral_info.referred_by && <p>Referred by: {user.referral_info.referred_by}</p>}
                {user.referral_info.referrals?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-neutral-500">People referred:</p>
                    {user.referral_info.referrals.map((r, i) => <p key={i}>{r.name}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBanModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-blue mb-4">Ban User</h3>
            <textarea placeholder="Reason for ban..." value={banReason} onChange={e => setBanReason(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-3 text-sm h-24 mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBanModal(false)} className="px-4 py-2 text-sm text-neutral-500 cursor-pointer">Cancel</button>
              <button onClick={banUser} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700">Ban User</button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600 mb-2">Permanent Delete</h3>
            <p className="text-sm text-neutral-500 mb-4">This action cannot be undone. Type DELETE to confirm.</p>
            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" className="w-full border border-neutral-200 rounded-lg p-3 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} className="px-4 py-2 text-sm text-neutral-500 cursor-pointer">Cancel</button>
              <button onClick={permanentDelete} disabled={deleteConfirm !== 'DELETE'} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-30">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
