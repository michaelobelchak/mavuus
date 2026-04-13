import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion, AnimatePresence } from 'motion/react'
import { X, Keyboard } from 'lucide-react'

const shortcuts = [
  {
    section: 'Global',
    items: [
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['/'], label: 'Focus search' },
      { keys: ['Esc'], label: 'Close dialog or drawer' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { keys: ['g', 'h'], label: 'Go to Dashboard home' },
      { keys: ['g', 'l'], label: 'Go to Live Sessions' },
      { keys: ['g', 'm'], label: 'Go to Messages' },
      { keys: ['g', 'j'], label: 'Go to Jobs' },
      { keys: ['g', 'p'], label: 'Go to Profile' },
    ],
  },
]

const navMap = {
  h: '/dashboard',
  l: '/dashboard/live-sessions',
  m: '/dashboard/messages',
  j: '/dashboard/jobs',
  p: '/dashboard/profile',
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-semibold text-neutral-600 bg-white border border-neutral-200 rounded shadow-sm">
      {children}
    </kbd>
  )
}

export default function ShortcutsHelp() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let gTimer = null
    let gArmed = false

    const isTyping = (target) =>
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)

    const onKey = (e) => {
      if (isTyping(e.target)) return

      // ? opens the help overlay
      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
        return
      }

      // g-then-letter navigation (Gmail-style)
      if (e.key === 'g' && !gArmed) {
        gArmed = true
        clearTimeout(gTimer)
        gTimer = setTimeout(() => { gArmed = false }, 1000)
        return
      }
      if (gArmed && navMap[e.key]) {
        e.preventDefault()
        gArmed = false
        clearTimeout(gTimer)
        navigate(navMap[e.key])
        return
      }
      if (gArmed) {
        gArmed = false
        clearTimeout(gTimer)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(gTimer)
    }
  }, [open, navigate])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] p-6 md:p-8 relative"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close shortcuts"
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-dark-blue transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink/15 to-brand-blue/15 flex items-center justify-center text-brand-pink">
                <Keyboard size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark-blue">Keyboard shortcuts</h2>
                <p className="text-xs text-neutral-500">Press <Kbd>?</Kbd> anytime to open this</p>
              </div>
            </div>

            <div className="space-y-5">
              {shortcuts.map((section) => (
                <div key={section.section}>
                  <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-400 mb-2">
                    {section.section}
                  </p>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-sm text-dark-blue">{item.label}</span>
                        <span className="flex items-center gap-1">
                          {item.keys.map((k, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && <span className="text-xs text-neutral-300">then</span>}
                              <Kbd>{k}</Kbd>
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
