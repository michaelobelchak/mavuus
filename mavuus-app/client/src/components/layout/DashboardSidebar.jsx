import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
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
  LogOut,
  X,
  Gift,
  Copy,
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Live Sessions', path: '/dashboard/live-sessions', icon: Radio },
  { label: 'On-Demand Videos', path: '/dashboard/on-demand', icon: PlayCircle },
  { label: 'Community Resources', path: '/dashboard/resources', icon: FolderOpen },
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
]

export default function DashboardSidebar({ mobileOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

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
        fixed lg:sticky top-0 left-0 z-50 w-64 bg-white border-r border-neutral-100 h-screen flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 h-20 flex items-center justify-between border-b border-neutral-100">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-[29px] h-[31px]" />
            <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-[20px]" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-neutral-500 hover:text-dark-blue cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User profile card */}
        {user && (
          <Link
            to="/dashboard/profile"
            onClick={handleNavClick}
            className="mx-3 mt-4 mb-2 flex items-center gap-3 p-3 rounded-xl bg-bg-light hover:bg-brand-pink/5 transition-colors group"
          >
            <Avatar name={user.name} src={user.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-blue truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 truncate">View profile</p>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link, index) => {
            if (link.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-neutral-100 my-2" />
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
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-brand-pink/10 text-brand-pink'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-dark-blue'
                  }
                `}
              >
                <Icon size={18} />
                <span className="flex-1">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Referral card */}
        <div className="px-3 pt-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-pink/10 via-brand-pink/5 to-brand-blue/10 p-4 border border-brand-pink/10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-brand-pink/15 flex items-center justify-center text-brand-pink">
                <Gift size={14} />
              </div>
              <p className="text-sm font-semibold text-dark-blue">Invite a friend</p>
            </div>
            <p className="text-xs text-neutral-500 leading-snug mb-3">
              Share Mavuus with a marketing peer and get a free month of Pro.
            </p>
            <button
              onClick={handleCopyReferral}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-xs font-semibold text-dark-blue hover:bg-white transition-colors cursor-pointer"
            >
              <Copy size={12} /> Copy referral link
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 mt-2 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-100 hover:text-dark-blue transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
