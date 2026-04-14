import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.*> in JSX
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Briefcase, MessageCircle, Users } from 'lucide-react'

const actions = [
  { icon: Briefcase, label: 'Browse jobs', path: '/dashboard/jobs', color: 'bg-brand-blue' },
  { icon: MessageCircle, label: 'Messages', path: '/dashboard/messages', color: 'bg-brand-pink' },
  { icon: Users, label: 'Members', path: '/dashboard/members', color: 'bg-dark-blue' },
]

export default function MobileFAB() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3">
            {actions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => {
                    navigate(action.path)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-white shadow-lg border border-neutral-100 cursor-pointer"
                >
                  <span className={`w-8 h-8 rounded-full ${action.color} text-white flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} />
                  </span>
                  <span className="text-sm font-semibold text-dark-blue whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="w-14 h-14 rounded-full bg-brand-pink text-white shadow-[0_8px_32px_rgba(242,109,146,0.45)] flex items-center justify-center cursor-pointer"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </motion.button>
    </div>
  )
}
