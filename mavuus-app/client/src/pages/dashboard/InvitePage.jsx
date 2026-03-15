import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { Copy, Check, Users, Gift } from 'lucide-react'

export default function InvitePage() {
  const { token } = useAuth()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [stats, setStats] = useState({ count: 0, referrals: [] })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          fetch('/api/referrals/my-code', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/referrals/stats', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (codeRes.ok) {
          const data = await codeRes.json()
          setCode(data.code)
        }
        if (statsRes.ok) setStats(await statsRes.json())
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [token])

  const referralLink = `${window.location.origin}/register?ref=${code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-dark-blue mb-6">Invite Friends</h1>

      {/* Referral Link Card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center">
            <Gift size={20} className="text-brand-pink" />
          </div>
          <div>
            <h2 className="font-semibold text-dark-blue">Share Your Referral Link</h2>
            <p className="text-sm text-neutral-500">Invite marketing leaders to join Mavuus</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-600 font-mono"
          />
          <Button onClick={handleCopy} variant={copied ? 'outline' : 'primary'}>
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
          </Button>
        </div>

        <p className="text-xs text-neutral-400 mt-3">
          Your referral code: <span className="font-mono font-semibold">{code}</span>
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <Users size={20} className="text-brand-blue" />
          </div>
          <div>
            <h2 className="font-semibold text-dark-blue">Your Referrals</h2>
            <p className="text-sm text-neutral-500">
              You&apos;ve invited <span className="font-semibold text-brand-pink">{stats.count}</span> {stats.count === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>

        {stats.referrals.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.referrals.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
                <Avatar name={r.name} src={r.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-blue">{r.name}</p>
                  <p className="text-xs text-neutral-500">{r.title}{r.company ? `, ${r.company}` : ''}</p>
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
