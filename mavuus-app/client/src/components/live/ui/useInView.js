import { useEffect, useState } from 'react'

const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window

// Becomes true once the element has scrolled into view, then stays true.
export default function useInView(ref, { threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const [inView, setInView] = useState(!canObserve)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, inView, threshold, rootMargin])

  return inView
}
