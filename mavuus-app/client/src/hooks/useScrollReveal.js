import { useEffect, useRef, useState } from 'react'

/**
 * useScrollReveal - Intersection Observer hook for scroll-triggered animations
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0-1). Default: 0.15
 * @param {string} options.rootMargin - Root margin. Default: '0px 0px -60px 0px'
 * @param {boolean} options.once - Only trigger once. Default: true
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export default function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(element)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}
