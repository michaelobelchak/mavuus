import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import { EventCard, SectionHeader } from './cards'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function ArrowButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-dark-blue text-dark-blue transition-colors duration-200 hover:border-brand-pink hover:text-brand-pink disabled:cursor-default disabled:border-live-track disabled:text-live-faint"
    >
      {children}
    </button>
  )
}

/**
 * Upcoming events as a swipeable row. Arrows scroll one card at a time; cards outside the
 * visible area are inert so keyboard and screen reader users only reach what they can see.
 */
export default function EventsSlider({ events }) {
  const trackRef = useRef(null)
  const [visible, setVisible] = useState(() => new Set(events.map((_, i) => i)))
  const few = events.length < 3
  const slideWidth = few
    ? 'w-[calc((100%-2rem)/2)] max-[767px]:w-[85%]'
    : 'w-[calc((100%-4rem)/3)] max-[991px]:w-[calc((100%-2rem)/2)] max-[767px]:w-[85%]'

  useEffect(() => {
    const track = trackRef.current
    if (!track || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((current) => {
          const next = new Set(current)
          entries.forEach((entry) => {
            const i = Number(entry.target.dataset.index)
            if (entry.intersectionRatio >= 0.6) next.add(i)
            else next.delete(i)
          })
          return next
        })
      },
      { root: track, threshold: [0, 0.6, 1] },
    )
    Array.from(track.children).forEach((slide) => observer.observe(slide))
    return () => observer.disconnect()
  }, [events.length])

  const move = (dir) => {
    const track = trackRef.current
    const first = track?.children[0]
    if (!first) return
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    track.scrollBy({ left: dir * (first.getBoundingClientRect().width + gap), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  const atStart = visible.has(0)
  const atEnd = visible.has(events.length - 1)

  return (
    <Section className="border-t border-live-hairline">
      <SectionHeader title="View Our Upcoming Live Events" count={events.length} noun="Events" />
      <Reveal>
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-2 [scrollbar-width:none] max-[767px]:-mx-5 max-[767px]:scroll-px-5 max-[767px]:gap-5 max-[767px]:px-5 [&::-webkit-scrollbar]:hidden"
        >
          {events.map((event, i) => (
            <div
              key={event.url}
              data-index={i}
              inert={!visible.has(i)}
              className={`flex-none snap-start ${slideWidth}`}
            >
              <EventCard event={event} href="/register" sizes="(max-width: 767px) 85vw, 620px" />
            </div>
          ))}
        </div>
        {!(atStart && atEnd) && (
          <div className="mt-8 flex justify-end gap-3">
            <ArrowButton label="Previous event" disabled={atStart} onClick={() => move(-1)}>
              <ArrowLeft size={20} aria-hidden="true" />
            </ArrowButton>
            <ArrowButton label="Next event" disabled={atEnd} onClick={() => move(1)}>
              <ArrowRight size={20} aria-hidden="true" />
            </ArrowButton>
          </div>
        )}
      </Reveal>
    </Section>
  )
}
