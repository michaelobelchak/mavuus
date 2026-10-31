import { useRef, useState } from 'react'
import LiveContainer from '../LiveContainer'
import { EventCard } from './cards'
import { ArrowBoxIcon, CircleArrowIcon } from './icons'
import { Link } from 'react-router-dom'

const SLIDE_CLASSES =
  'flex w-[calc((100%-4rem)/3)] flex-none flex-col items-start gap-[12.8px] max-lg:w-[calc((100%-3vw)/2)] max-md:w-[calc((100%-3vw)/2.1)] max-[479px]:w-[calc((100%-3vw)/1.2)]!'

export default function EventsSlider({ events }) {
  const trackRef = useRef(null)
  const listRef = useRef(null)
  const [offset, setOffset] = useState(0)

  const move = (dir) => {
    const list = listRef.current
    const track = trackRef.current
    if (!list || !track || !list.children.length) return
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    const step = list.children[0].getBoundingClientRect().width + gap
    const max = Math.max(0, list.scrollWidth - track.clientWidth)
    setOffset((current) => Math.min(max, Math.max(0, current + dir * step)))
  }

  return (
    <section>
      <LiveContainer innerClassName="py-24">
        <div className="border-b border-[#dbe0e7]">
          <div className="pt-20 pb-8 max-lg:pt-16">
            <div className="mt-12 flex flex-col gap-8">
              <div className="mb-8 flex items-center justify-between max-[479px]:flex-col max-[479px]:items-start max-[479px]:gap-4">
                <h2 className="text-dark-blue">View Our Upcoming Live Events</h2>
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-base leading-6 text-dark-blue no-underline transition-colors duration-300 hover:text-live-grey"
                >
                  <span>
                    Sign Up to get access to all <span className="text-brand-pink">{events.length}</span> Events
                  </span>
                  <ArrowBoxIcon className="size-6 shrink-0" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 top-1/4 z-10 flex items-center justify-between max-md:hidden">
                  <button
                    type="button"
                    aria-label="Previous event"
                    onClick={() => move(-1)}
                    className="bg-transparent px-1.5 py-px"
                  >
                    <CircleArrowIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next event"
                    onClick={() => move(1)}
                    className="bg-transparent px-1.5 py-px"
                  >
                    <CircleArrowIcon />
                  </button>
                </div>
                <div ref={trackRef} className="overflow-hidden max-md:-mx-5 max-md:overflow-x-auto">
                  <div
                    ref={listRef}
                    className="flex gap-16 pb-16 transition-transform duration-[600ms] ease-out max-lg:gap-[calc(3vw+2rem)] max-md:pl-10 max-md:pr-2.5"
                    style={{ transform: `translateX(-${offset}px)` }}
                  >
                    {events.map((event) => (
                      <EventCard key={event.url} event={event} imageHref="/register" className={SLIDE_CLASSES} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
