import { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff, CheckCircle2 } from 'lucide-react'

export default function ConnectionStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [showRecovered, setShowRecovered] = useState(false)

  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      setShowRecovered(true)
      setTimeout(() => setShowRecovered(false), 2500)
    }
    const onOffline = () => {
      setOnline(false)
      setShowRecovered(false)
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium shadow-[0_8px_32px_rgba(239,68,68,0.35)]"
        >
          <WifiOff size={16} />
          You&rsquo;re offline — changes may not save
        </motion.div>
      )}
      {online && showRecovered && (
        <motion.div
          key="online"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-green-500 text-white text-sm font-medium shadow-[0_8px_32px_rgba(34,197,94,0.35)]"
        >
          <CheckCircle2 size={16} />
          Back online
        </motion.div>
      )}
    </AnimatePresence>
  )
}
