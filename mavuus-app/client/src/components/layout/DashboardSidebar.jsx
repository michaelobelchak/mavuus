import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import ProgressRing from '../ui/ProgressRing'
import { useToast } from '../ui/Toast'
import {
  Home,
  Radio,
  PlayCircle,
  FolderOpen,
  Users,
  Store,
  Briefcase,
  BookmarkCheck,
  MessageCircle,
  UserCircle,
  UserCheck,
  Mic,
  UserPlus,
  LogOut,
  X,
  Gift,
  Copy,
  Shield,
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Live Sessions', path: '/dashboard/live-sessions', icon: Radio },
  { label: 'On-Demand Videos', path: '/dashboard/on-demand', icon: PlayCircle },
  { label: 'Community Resources', path: '/dashboard/resources', icon: FolderOpen },
  { label: 'Speakers', path: '/dashboard/speakers', icon: Mic },
  { type: 'separator' },
  { label: 'Meet The Members', path: '/dashboard/members', icon: Users },
  { label: 'Search for Vendors', path: '/dashboard/vendors', icon: Store },
  { type: 'separator' },
  { label: 'Search for Jobs', path: '/dashboard/jobs', icon: Briefcase },
  { label: 'My Jobs', path: '/dashboard/my-jobs', icon: BookmarkCheck },
  { type: 'separator' },
  { label: 'Messages', path: '/dashboard/messages', icon: MessageCircle, badge: true },
  { label: 'My Connections', path: '/dashboard/members?filter=connections', icon: UserCheck },
  { label: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
  { type: 'separator' },
  { label: 'Invite a Friend', path: '/dashboard/invite', icon: UserPlus },
]

function computeCompletion(profile) {
  if (!profile) return 0
  const checks = [
    !!profile.avatar_url,
    !!(profile.bio && profile.bio.trim()),
    (profile.skills?.length || 0) >= 3,
    (profile.experience?.length || 0) >= 1,
    !!profile.resume_filename,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

const adminLink = { label: 'Admin Panel', path: '/admin', icon: Shield }

export default function DashboardSidebar({ mobileOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const toast = useToast()
  const [completion, setCompletion] = useState(0)

  // Fetch profile once to compute completion ring
  useEffect(() => {
    if (!token) return
    let active = true
    fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setCompletion(computeCompletion(data))
      })
      .catch(() => {})
    return () => { active = false }
  }, [token, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  const handleCopyReferral = () => {
    const link = `${window.location.origin}/register?ref=${user?.id || 'demo'}`
    navigator.clipboard?.writeText(link)
    toast.success('Referral link copied to clipboard')
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-64 h-screen flex flex-col
        bg-gradient-to-b from-[#164A6A] via-[#1F648D] to-[#164A6A]
        text-white/90 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative radial accent */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-60 bg-gradient-to-br from-brand-pink/15 via-transparent to-transparent" />

        {/* Logo */}
        <div className="relative px-6 h-20 flex items-center justify-between border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-[29px] h-[31px]" />
            <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-[20px] brightness-0 invert" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User profile card with completion ring — glass */}
        {user && (
          <Link
            to="/dashboard/profile"
            onClick={handleNavClick}
            className="relative mx-3 mt-4 mb-2 flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors group"
          >
            <ProgressRing size={48} strokeWidth={3} progress={completion}>
              <Avatar
                name={user.name}
                src={user.avatar_url}
                size="sm"
                pro={user.membership_tier === 'pro'}
              />
            </ProgressRing>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">
                {completion < 100 ? `Profile ${completion}% complete` : 'Profile complete'}
              </p>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link, index) => {
            if (link.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-white/10 my-2" />
            }

            const Icon = link.icon
            const isActive = link.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(link.path)

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_0_24px_rgba(242,109,146,0.2)]'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-brand-pink drop-shadow-[0_0_6px_rgba(242,109,146,0.6)]' : ''}
                />
                <span className="flex-1">{link.label}</span>
              </Link>
            )
          })}
          {user?.role === 'admin' && (
            <>
              <div className="h-px bg-neutral-100 my-2" />
              <Link
                to={adminLink.path}
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin')
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-purple-500 hover:bg-purple-50 hover:text-purple-700'
                  }
                `}
              >
                <Shield size={18} />
                <span className="flex-1">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* Referral card — glass */}
        <div className="relative px-3 pt-2">
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/15">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-brand-pink/30 flex items-center justify-center text-white">
                <Gift size={14} />
              </div>
              <p className="text-sm font-semibold text-white">Invite a friend</p>
            </div>
            <p className="text-xs text-white/70 leading-snug mb-3">
              Share Mavuus with a marketing peer and get a free month of Pro.
            </p>
            <button
              onClick={handleCopyReferral}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-pink text-white text-xs font-semibold hover:bg-brand-pink-hover transition-colors cursor-pointer shadow-[0_4px_15px_rgba(242,109,146,0.35)]"
            >
              <Copy size={12} /> Copy referral link
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="relative px-3 py-4 mt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
