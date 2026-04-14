// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, Outlet } from 'react-router-dom'

export default function PageTransition() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
