import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/mergeRefs'
import { parseCount, formatCount } from './countFormat'

const DURATION_MS = 1200

/**
 * Counts a stat like "1,100+", "~$2.1M" or 430 up from zero once it is in view (ease-out, 1.2s).
 * Screen readers always get the final value; reduced motion shows the final value right away.
 * Values without a number are shown as they are.
 */
export function CountUp({ value, className, ref, ...props }) {
  const innerRef = useRef(null)
  const inView = useInView(innerRef, { threshold: 0.6 })
  const reduced = useReducedMotion()
  const parts = useMemo(() => (reduced ? null : parseCount(value)), [value, reduced])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView || !parts) return undefined
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION_MS, 1)
      setProgress(1 - (1 - t) ** 4)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, parts])

  const shown = parts && progress < 1 ? formatCount(parts, parts.target * progress) : value

  return (
    <span
      ref={mergeRefs(innerRef, ref)}
      className={cn('tabular-nums', className)}
      {...props}
    >
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
