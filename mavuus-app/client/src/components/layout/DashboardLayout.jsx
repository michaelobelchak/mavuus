import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import { Bell, Search, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  // Fetch unread count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('mavuus_token')
        const res = await fetch('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count)
        }
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!notifOpen) return
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('mavuus_token')
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setNotifications(await res.json())
      } catch {}
    }
    fetchNotifs()
  }, [notifOpen])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
    } catch {}
  }

  return (
    <div className="flex min-h-screen bg-bg-light">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 lg:h-20 bg-white border-b border-neutral-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
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
                type="text"
                placeholder="Search sessions, resources, members..."
                className="w-full bg-transparent text-sm text-neutral-600 placeholder:text-neutral-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-neutral-500 hover:text-dark-blue transition-colors cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <span className="text-sm font-semibold text-dark-blue">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-brand-pink hover:underline cursor-pointer">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-neutral-500 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <Link
                          key={n.id}
                          to={n.link || '#'}
                          onClick={() => setNotifOpen(false)}
                          className={`block px-4 py-3 hover:bg-neutral-50 border-b border-neutral-50 ${!n.is_read ? 'bg-brand-pink/5' : ''}`}
                        >
                          <p className="text-sm font-medium text-dark-blue">{n.title}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-neutral-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-dark-blue">{user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500">Pro Member</p>
                </div>
                <ChevronDown size={14} className="hidden sm:block text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard/profile?tab=account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="h-px bg-neutral-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
