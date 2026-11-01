import { useEffect, useMemo, useRef, useState } from 'react'
import useInView from './useInView'

const DURATION_MS = 1200

function parse(value) {
  const match = String(value).match(/^(\D*)([\d.,]+)(.*)$/)
  if (!match) return null
  const [, prefix, raw, suffix] = match
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  return { prefix, suffix, target: Number(raw.replace(/,/g, '')), decimals, grouped: raw.includes(',') }
}

function format({ prefix, suffix, decimals, grouped }, n) {
  const shown = grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals)
  return `${prefix}${shown}${suffix}`
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Counts a stat like "1,100+" or "~$2.1M" up from zero once it's visible. Screen readers get the final value.
export default function CountUp({ value, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { threshold: 0.6 })
  const parts = useMemo(() => (reducedMotion() ? null : parse(value)), [value])
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

  let shown = value
  if (parts && progress < 1) shown = format(parts, parts.target * progress)

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
