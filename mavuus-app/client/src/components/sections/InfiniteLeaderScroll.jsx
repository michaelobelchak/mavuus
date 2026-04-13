import { useRef, useEffect, useState } from 'react'
import AnimatedSection from '../ui/AnimatedSection'

/**
 * InfiniteLeaderScroll - Auto-scrolling horizontal row of marketing leader cards
 * The row scrolls continuously at a slow speed, pausing on hover.
 *
 * @param {Object} props
 * @param {Array} props.leaders - Array of { id, name, title, avatar } objects
 * @param {number} props.speed - Pixels per second. Default: 30
 */
export default function InfiniteLeaderScroll({ leaders, speed = 30 }) {
  const scrollRef = useRef(null)
  const animationRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const lastTimestampRef = useRef(null)
  const scrollPositionRef = useRef(0)

  // Duplicate leaders enough times to fill the screen multiple times
  const duplicated = [...leaders, ...leaders, ...leaders]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const singleSetWidth = container.scrollWidth / 3

    const animate = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp
      const delta = timestamp - lastTimestampRef.current
      lastTimestampRef.current = timestamp

      if (!isPaused) {
        scrollPositionRef.current += (speed * delta) / 1000

        // Reset when we've scrolled past one full set
        if (scrollPositionRef.current >= singleSetWidth) {
          scrollPositionRef.current -= singleSetWidth
        }

        container.style.transform = `translateX(-${scrollPositionRef.current}px)`
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, speed])

  return (
    <section className="py-24 px-6 md:px-12 lg:px-[104px] overflow-hidden">
      <AnimatedSection animation="fade-up">
        <div className="mb-16">
          <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold leading-[1.3] text-neutral-600">
            The{' '}
            <span className="text-brand-pink">Ultimate </span>
            Collective
            <br />
            of Marketing{' '}
            <span className="text-brand-pink">Leaders</span>
          </h2>
        </div>
      </AnimatedSection>

      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 64px, black calc(100% - 64px), transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 64px, black calc(100% - 64px), transparent)',
        }}
      >
        <div
          ref={scrollRef}
          className="flex gap-0 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicated.map((leader, index) => (
            <div
              key={`${leader.id}-${index}`}
              className="w-[160px] md:w-[180px] lg:w-[220px] flex-shrink-0 flex flex-col items-center group"
            >
              <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] lg:w-[180px] lg:h-[180px] rounded-full overflow-hidden mb-4 border-4 border-transparent group-hover:border-brand-pink/30 transition-all duration-500 group-hover:scale-105">
                <img
                  src={leader.avatar}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[16px] font-semibold text-dark-blue text-center leading-tight">
                {leader.name}
              </p>
              <p className="text-[13px] text-[#8692A1] text-center mt-1 leading-tight px-2">
                {leader.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
