import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Users, Video, BookOpen, Mic, Store, Briefcase,
  MessageSquare, Star, ThumbsUp, FileText, Quote, Image, HelpCircle,
  Tag, Bell, Gift, Settings, Shield, Download, ChevronDown, ChevronRight,
  ArrowLeft, Menu, X, Mail
} from 'lucide-react'

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    label: 'USERS',
    items: [
      { label: 'User Management', icon: Users, path: '/admin/users' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { label: 'Sessions', icon: Video, path: '/admin/sessions' },
      { label: 'Resources', icon: BookOpen, path: '/admin/resources' },
      { label: 'Speakers', icon: Mic, path: '/admin/speakers' },
    ],
  },
  {
    label: 'MARKETPLACE',
    items: [
      { label: 'Vendors', icon: Store, path: '/admin/vendors' },
      { label: 'Jobs', icon: Briefcase, path: '/admin/jobs' },
    ],
  },
  {
    label: 'MODERATION',
    items: [
      { label: 'Comments', icon: MessageSquare, path: '/admin/comments' },
      { label: 'Reviews', icon: Star, path: '/admin/reviews' },
      { label: 'Recommendations', icon: ThumbsUp, path: '/admin/recommendations' },
      { label: 'Contact', icon: Mail, path: '/admin/contact' },
    ],
  },
  {
    label: 'WEBSITE',
    items: [
      { label: 'Page Content', icon: FileText, path: '/admin/site-content' },
      { label: 'Testimonials', icon: Quote, path: '/admin/testimonials' },
      { label: 'Brand Logos', icon: Image, path: '/admin/brand-logos' },
      { label: 'FAQ', icon: HelpCircle, path: '/admin/faq' },
      { label: 'Categories', icon: Tag, path: '/admin/categories' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
      { label: 'Referrals', icon: Gift, path: '/admin/referrals' },
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
      { label: 'Audit Log', icon: Shield, path: '/admin/audit-log' },
      { label: 'Data Exports', icon: Download, path: '/admin/exports' },
    ],
  },
]

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState({})

  const toggleSection = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-[#1E1B4B] text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/admin" className="text-lg font-bold tracking-tight">Mavuus Admin</Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {sections.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-2 py-2 text-[10px] font-semibold tracking-widest text-white/40 uppercase hover:text-white/60 cursor-pointer"
            >
              {section.label}
              {collapsed[section.label] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
            {!collapsed[section.label] && section.items.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-brand-pink/20 text-brand-pink font-medium'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-white/50">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 fixed inset-y-0 left-0 z-40">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="w-60 h-full" onClick={e => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-neutral-100 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-neutral-600 cursor-pointer">
              <Menu size={20} />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue transition-colors">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
