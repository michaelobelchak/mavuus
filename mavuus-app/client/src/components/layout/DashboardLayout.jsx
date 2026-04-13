import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import PageTransition from '../ui/PageTransition'
import Tooltip from '../ui/Tooltip'
import MobileFAB from '../ui/MobileFAB'
import { Bell, Search, Menu, User, Settings, LogOut, ChevronDown, X, UserPlus, MessageCircle, Briefcase, Radio, CheckCircle, Star } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

const notifIcons = {
  connection: UserPlus,
  message: MessageCircle,
  job: Briefcase,
  session: Radio,
  system: CheckCircle,
  review: Star,
}

const notifColors = {
  connection: 'bg-blue-50 text-blue-500',
  message: 'bg-purple-50 text-purple-500',
  job: 'bg-green-50 text-green-500',
  session: 'bg-brand-pink/10 text-brand-pink',
  system: 'bg-neutral-100 text-neutral-500',
  review: 'bg-amber-50 text-amber-500',
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardLayout() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [bellPulse, setBellPulse] = useState(false)
  const prevUnreadRef = useRef(0)
  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  // Fetch unread count — pulse bell when count increases
  useEffect(() => {
    if (!token) return
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.count > prevUnreadRef.current && prevUnreadRef.current > 0) {
            setBellPulse(true)
            setTimeout(() => setBellPulse(false), 700)
          }
          prevUnreadRef.current = data.count
          setUnreadCount(data.count)
        }
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [token])

  // Global "/" shortcut focuses search — ignore when typing in an input
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== '/') return
      const target = e.target
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (!notifOpen || !token) return
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setNotifications(await res.json())
      } catch { /* silent */ }
    }
    fetchNotifs()
  }, [notifOpen, token])

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (notifOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [notifOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('mavuus_token')
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch { /* silent */ }
  }

  const markOneRead = async (id) => {
    try {
      const token = localStorage.getItem('mavuus_token')
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  return (
    <div className="flex min-h-screen bg-bg-light">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 lg:h-20 glass-heavy border-b border-neutral-100/50 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-dark-blue cursor-pointer p-1"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md">
              <Search size={18} className="text-neutral-300" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search sessions, resources, members..."
                className="flex-1 bg-transparent text-sm text-neutral-600 placeholder:text-neutral-300 focus:outline-none"
              />
              <kbd className="hidden md:inline-flex items-center justify-center h-5 min-w-[22px] px-1.5 text-[11px] font-semibold text-neutral-400 bg-white border border-neutral-200 rounded">
                /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Messages shortcut */}
            <Tooltip content="Messages">
              <Link
                to="/dashboard/messages"
                aria-label="Messages"
                className="text-neutral-500 hover:text-dark-blue transition-colors cursor-pointer"
              >
                <MessageCircle size={20} />
              </Link>
            </Tooltip>

            {/* Notifications Bell */}
            <Tooltip content="Notifications">
              <button
                onClick={() => setNotifOpen(true)}
                aria-label="Notifications"
                className="relative text-neutral-500 hover:text-dark-blue transition-colors cursor-pointer"
              >
                <Bell size={20} className={bellPulse ? 'animate-shake text-brand-pink' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Account menu"
                className="flex items-center gap-2 pl-2 cursor-pointer"
              >
                <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
                <ChevronDown size={14} className="text-neutral-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-neutral-100 shadow-lg py-1 z-40">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-dark-blue truncate">{user?.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to="/dashboard/profile?tab=account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <PageTransition />
        </main>
      </div>

      {/* Mobile floating action menu */}
      <MobileFAB />

      {/* Notification Drawer Overlay */}
      {notifOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={() => setNotifOpen(false)}
        />
      )}

      {/* Notification Drawer */}
      <div className={`
        fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${notifOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-dark-blue">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-neutral-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-pink hover:underline cursor-pointer font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setNotifOpen(false)}
              className="text-neutral-400 hover:text-dark-blue transition-colors cursor-pointer p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
              <Bell size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1">We&apos;ll notify you when something happens</p>
            </div>
          ) : (
            <div>
              {notifications.map(n => {
                const Icon = notifIcons[n.type] || CheckCircle
                const colorClass = notifColors[n.type] || notifColors.system

                return (
                  <Link
                    key={n.id}
                    to={n.link || '#'}
                    onClick={() => {
                      if (!n.is_read) markOneRead(n.id)
                      setNotifOpen(false)
                    }}
                    className={`
                      flex items-start gap-4 px-6 py-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors
                      ${!n.is_read ? 'bg-brand-pink/[0.03]' : ''}
                    `}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold text-dark-blue' : 'font-medium text-neutral-600'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-pink flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-neutral-400 mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
