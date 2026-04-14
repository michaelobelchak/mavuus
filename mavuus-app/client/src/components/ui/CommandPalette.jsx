import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  Radio,
  PlayCircle,
  FileText,
  Users,
  Store,
  Briefcase,
  Home,
  MessageCircle,
  UserCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PAGE_COMMANDS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home, section: 'Navigate' },
  { id: 'live', label: 'Live Sessions', path: '/dashboard/live-sessions', icon: Radio, section: 'Navigate' },
  { id: 'on-demand', label: 'On-Demand Videos', path: '/dashboard/on-demand', icon: PlayCircle, section: 'Navigate' },
  { id: 'resources', label: 'Community Resources', path: '/dashboard/resources', icon: FileText, section: 'Navigate' },
  { id: 'members', label: 'Members', path: '/dashboard/members', icon: Users, section: 'Navigate' },
  { id: 'vendors', label: 'Vendors', path: '/dashboard/vendors', icon: Store, section: 'Navigate' },
  { id: 'jobs', label: 'Jobs', path: '/dashboard/jobs', icon: Briefcase, section: 'Navigate' },
  { id: 'messages', label: 'Messages', path: '/dashboard/messages', icon: MessageCircle, section: 'Navigate' },
  { id: 'profile', label: 'My Profile', path: '/dashboard/profile', icon: UserCircle, section: 'Navigate' },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState({ members: [], sessions: [], resources: [], jobs: [], vendors: [] })
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Toggle on Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Reset state on close + focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setResults({ members: [], sessions: [], resources: [], jobs: [], vendors: [] })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search across several endpoints
  useEffect(() => {
    if (!open || !query.trim() || !token) {
      setSearching(false)
      return
    }
    const controller = new AbortController()
    const t = setTimeout(async () => {
      setSearching(true)
      const auth = { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
      try {
        const [members, sessions, resources, jobs, vendors] = await Promise.all([
          fetch(`/api/members?q=${encodeURIComponent(query)}`, auth).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/sessions', auth).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch(`/api/resources?limit=20`, auth).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/jobs', auth).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/vendors', auth).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ])
        const q = query.toLowerCase()
        setResults({
          members: (Array.isArray(members) ? members : []).filter((m) =>
            `${m.name} ${m.title || ''} ${m.company || ''}`.toLowerCase().includes(q)
          ).slice(0, 4),
          sessions: (Array.isArray(sessions) ? sessions : []).filter((s) =>
            `${s.title} ${s.speaker_name || ''}`.toLowerCase().includes(q)
          ).slice(0, 4),
          resources: (Array.isArray(resources) ? resources : []).filter((r) =>
            `${r.title} ${r.author || ''}`.toLowerCase().includes(q)
          ).slice(0, 4),
          jobs: (Array.isArray(jobs) ? jobs : []).filter((j) =>
            `${j.title} ${j.company || ''}`.toLowerCase().includes(q)
          ).slice(0, 4),
          vendors: (Array.isArray(vendors) ? vendors : []).filter((v) =>
            `${v.company_name || ''}`.toLowerCase().includes(q)
          ).slice(0, 4),
        })
      } finally {
        setSearching(false)
      }
    }, 180)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [open, query, token])

  // Flattened items for keyboard nav
  const flat = useMemo(() => {
    if (!query.trim()) {
      return PAGE_COMMANDS.map((c) => ({
        ...c,
        kind: 'page',
        onSelect: () => navigate(c.path),
      }))
    }
    const items = []
    const push = (section, list, toPath, iconOverride) => {
      list.forEach((item) => {
        const label =
          item.title ||
          item.name ||
          item.company_name ||
          'Untitled'
        const sub =
          item.company ||
          item.speaker_name ||
          item.author ||
          item.title ||
          ''
        items.push({
          id: `${section}-${item.id}`,
          section,
          label,
          sub,
          icon: iconOverride,
          kind: 'result',
          onSelect: () => navigate(toPath(item)),
        })
      })
    }
    push('Members', results.members, (m) => `/dashboard/members/${m.id}`, Users)
    push('Sessions', results.sessions, (s) => `/dashboard/${s.type === 'live' ? 'live-sessions' : 'on-demand'}/${s.id}`, Radio)
    push('Resources', results.resources, (r) => `/dashboard/resources/${r.id}`, FileText)
    push('Jobs', results.jobs, (j) => `/dashboard/jobs/${j.id}`, Briefcase)
    push('Vendors', results.vendors, (v) => `/dashboard/vendors/${v.id}`, Store)
    return items
  }, [query, results, navigate])

  // Keep activeIndex in range
  useEffect(() => {
    if (activeIndex >= flat.length) setActiveIndex(0)
  }, [flat.length, activeIndex])

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = flat[activeIndex]
      if (item) {
        item.onSelect()
        setOpen(false)
      }
    }
  }

  // Group items by section for rendering
  const grouped = useMemo(() => {
    const map = {}
    flat.forEach((item, idx) => {
      const section = item.section || 'Results'
      if (!map[section]) map[section] = []
      map[section].push({ ...item, _idx: idx })
    })
    return map
  }, [flat])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[180] flex items-start justify-center p-4 pt-[10vh] bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] overflow-hidden"
            role="dialog"
            aria-label="Command palette"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100">
              <Search size={18} className="text-neutral-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search or jump to a page…"
                className="flex-1 bg-transparent text-[15px] text-dark-blue placeholder:text-neutral-300 outline-none"
              />
              {searching && <Loader2 size={16} className="text-neutral-400 animate-spin" />}
              <kbd className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 text-[11px] font-semibold text-neutral-400 bg-white border border-neutral-200 rounded shadow-sm">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[420px] overflow-y-auto">
              {flat.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm text-neutral-400">No matches for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                Object.entries(grouped).map(([section, items]) => (
                  <div key={section} className="py-2">
                    <p className="px-4 text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-400 mb-1">
                      {section}
                    </p>
                    {items.map((item) => {
                      const Icon = item.icon
                      const isActive = item._idx === activeIndex
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(item._idx)}
                          onClick={() => {
                            item.onSelect()
                            setOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors ${
                            isActive ? 'bg-brand-pink/10' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isActive ? 'bg-brand-pink/15 text-brand-pink' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {Icon && <Icon size={16} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-brand-pink' : 'text-dark-blue'}`}>
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="text-xs text-neutral-500 truncate">{item.sub}</p>
                            )}
                          </div>
                          {isActive && <ArrowRight size={14} className="text-brand-pink flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 text-[11px] text-neutral-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-neutral-200 rounded font-semibold">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded font-semibold">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded font-semibold">⌘K</kbd>
                to toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
