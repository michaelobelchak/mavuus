import { motion } from 'motion/react'

export default function HoverCard({ children, className = '', glow = false, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`
        bg-white rounded-2xl border border-neutral-100 transition-shadow duration-300
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]
        ${glow ? 'hover:shadow-[0_0_24px_rgba(242,109,146,0.25)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
