import { useRef } from 'react'
import useInView from './useInView'

const STEP_MS = 70
const MAX_DELAY_MS = 420

/**
 * Shows its content when it scrolls into view. Styles live in design-system/styles/motion.css under [data-reveal].
 * variant: 'rise' (text, cards), 'fade' (subtle), 'clip' (images: the frame opens up).
 * index: position in a list, for a capped stagger.
 */
export default function Reveal({ as: Tag = 'div', variant = 'rise', index = 0, delay = 0, className = '', style, children, ...props }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  const total = Math.min(delay + index * STEP_MS, MAX_DELAY_MS + delay)

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-armed=""
      data-in={inView ? '' : undefined}
      className={className}
      style={{ '--reveal-delay': `${total}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}
