import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

function readProgress() {
  if (typeof window === 'undefined') return 0
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  return scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0
}

/**
 * A thin pink bar across the top of the window that fills as the document scrolls: reading
 * progress on long articles (ResourceDetailPage). Decorative, so it is hidden from screen readers
 * and never takes clicks. The width comes from the `--scroll-progress` custom property.
 * `className` and other props go to the track.
 */
export function ScrollProgress({ className, ref, ...props }) {
  const [progress, setProgress] = useState(readProgress)

  useEffect(() => {
    const onScroll = () => setProgress(readProgress())
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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
        className="h-full w-(--scroll-progress) bg-surface-brand transition-[width] duration-100 ease-move motion-reduce:transition-none"
        style={{ '--scroll-progress': `${progress}%` }}
      />
    </div>
  )
}
