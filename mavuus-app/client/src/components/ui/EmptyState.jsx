// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion } from 'motion/react'

export default function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="relative mb-5">
          {/* Soft glow halo */}
          <div className="absolute inset-0 bg-brand-pink/15 rounded-full blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-pink/10 to-brand-blue/10 border border-brand-pink/10 flex items-center justify-center">
            <Icon size={32} className="text-brand-pink" strokeWidth={1.5} />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-blue mb-2">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">{message}</p>}
      {action && action}
    </motion.div>
  )
}
