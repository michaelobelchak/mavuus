import { useEffect, useState } from 'react'

const canObserve = () => typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function'

/**
 * True once the element behind `ref` has scrolled into view, then stays true.
 * Without IntersectionObserver (old browsers, tests) it is true right away, so content never stays hidden.
 */
export function useInView(ref, { threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const [inView, setInView] = useState(() => !canObserve())

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return undefined
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, inView, threshold, rootMargin])

  return inView
}
