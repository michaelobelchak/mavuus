import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

// The scrolled share of the document, 0 to 1.
function readProgress() {
  if (typeof window === 'undefined') return 0
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
}

/**
 * A thin pink bar across the top of the window that fills as the document scrolls: reading
 * progress on long articles (ResourceDetailPage). Decorative, so it is hidden from screen readers
 * and never takes clicks. It reads the scroll at most once per animation frame and scales the bar
 * with a transform (`--scroll-progress`, 0 to 1), so scrolling never triggers layout.
 * `className` and other props go to the track.
 */
export function ScrollProgress({ className, ref, ...props }) {
  const [progress, setProgress] = useState(readProgress)

  useEffect(() => {
    let frame = null
    const onScroll = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        setProgress(readProgress())
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-scroll-progress=""
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-(--ds-z-overlay) h-1', className)}
      {...props}
    >
      <div
        className="h-full w-full origin-left scale-x-(--scroll-progress) bg-surface-brand transition-transform duration-100 ease-move motion-reduce:transition-none"
        style={{ '--scroll-progress': String(progress) }}
      />
    </div>
  )
}
