import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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

export default function DashboardSidebar({ mobileOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
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

        {/* Logout */}
        <div className="px-3 py-4 border-t border-neutral-100">
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
