import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.button> in JSX
import { motion, AnimatePresence } from 'motion/react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-brand-pink text-white shadow-[0_4px_15px_rgba(242,109,146,0.35)] flex items-center justify-center hover:bg-brand-pink-hover hover:scale-105 transition-transform cursor-pointer"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
