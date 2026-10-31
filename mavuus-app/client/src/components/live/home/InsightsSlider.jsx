import { useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import LiveContainer from '../LiveContainer'
import { H2, Highlight, OutlineButton } from './shared'
import { VIDEOS } from '../../../data/live/videos'

// Splide settings from the live page: 3 per page with a 2em gap, then 2 / 2.1 / 1.2 per page with a 3vw gap.
const LAYOUTS = [
  { query: '(max-width: 479px)', perPage: 1.2, gap: '3vw' },
  { query: '(max-width: 767px)', perPage: 2.1, gap: '3vw' },
  { query: '(max-width: 991px)', perPage: 2, gap: '3vw' },
]
const DESKTOP = { perPage: 3, gap: '2em' }

function subscribe(callback) {
  const lists = LAYOUTS.map((l) => window.matchMedia(l.query))
  lists.forEach((l) => l.addEventListener('change', callback))
  return () => lists.forEach((l) => l.removeEventListener('change', callback))
}

function getLayoutIndex() {
  return LAYOUTS.findIndex((l) => window.matchMedia(l.query).matches)
}

function ArrowIcon({ direction }) {
  const isPrev = direction === 'prev'
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="#1C2232" strokeWidth="2" />
      <path
        d={isPrev ? 'M21.7188 31L15.0017 24L21.7188 17' : 'M26.2812 17L32.9983 24L26.2812 31'}
        stroke="#050505"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={isPrev ? 'M16.2656 23.9683H31.9987' : 'M31.7344 24.0317L16.0013 24.0317'} stroke="#050505" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function VideoCard({ video }) {
  return (
    <div className="group flex flex-col items-start gap-[12.8px] pb-[12.8px] transition-transform duration-[400ms] hover:-translate-y-1.5">
      <Link to="/register" className="mb-6 w-full max-w-full text-brand-blue">
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="aspect-[3/2] h-full w-full max-w-full rounded-2xl object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
          />
          <div className="absolute z-[2] flex items-center justify-center rounded-2xl bg-[#f26d92eb] p-4 text-center font-medium text-white opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
            <div className="w-[191px] text-base leading-6">Sign Up for Mavuus to get access to all videos</div>
          </div>
          <div className="absolute flex size-12 items-center justify-center rounded-full border border-white bg-white/20 backdrop-blur-[15px]">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="relative left-0.5 size-[1.3rem] text-white">
              <path
                d="M3.33594 3.77025C3.33594 2.99208 4.18563 2.51209 4.85212 2.91377L11.8704 7.14352C12.5155 7.5323 12.5155 8.4677 11.8704 8.85648L4.85212 13.0862C4.18563 13.4879 3.33594 13.0079 3.33594 12.2298V3.77025Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </Link>
      <Link to="/register" className="mb-2 block max-w-full text-black no-underline">
        <h3 className="m-0 text-[22px] font-medium leading-[1.2] text-dark-blue max-[767px]:leading-[28.6px]">{video.title}</h3>
      </Link>
    </div>
  )
}

export default function InsightsSlider() {
  const layoutIndex = useSyncExternalStore(subscribe, getLayoutIndex, () => -1)
  const { perPage, gap } = layoutIndex === -1 ? DESKTOP : LAYOUTS[layoutIndex]
  const maxIndex = Math.max(0, Math.ceil(VIDEOS.length - perPage))
  const [rawIndex, setIndex] = useState(0)
  const index = Math.min(rawIndex, maxIndex)
  const touchX = useRef(null)

  const go = (delta) => setIndex(Math.max(0, Math.min(maxIndex, index + delta)))

  const slideWidth = `((100% - ${perPage - 1} * ${gap}) / ${perPage})`
  const overflow = `(${VIDEOS.length} * ${slideWidth} + ${VIDEOS.length - 1} * ${gap} - 100%)`
  const offset = `min(${index} * (${slideWidth} + ${gap}), ${overflow})`

  return (
    <section className="overflow-hidden">
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="mb-4 max-[767px]:-mx-5">
          <div className="mb-14 flex max-w-[800px] flex-col items-start gap-y-6 max-[767px]:mb-8 max-[767px]:px-5">
            <h2 className={`${H2} m-0`}>
              Mavuus <Highlight>Insights</Highlight>: Conversations That Shape Better <Highlight>Marketing</Highlight>{' '}
              Decisions
            </h2>
            <div className="flex max-w-[704px] flex-col gap-y-4">
              <p className="m-0 text-lg leading-[1.6]">
                Explore expert perspectives and conversations on marketing strategy, business growth, leadership and the
                challenges shaping today&apos;s marketing landscape.
              </p>
              <p className="m-0 text-lg leading-[1.6]">
                Whether you&apos;re a business executive looking to make smarter marketing investments or a marketing
                leader navigating an evolving role, our conversations bring together practical insights and real-world
                experiences.
              </p>
            </div>
          </div>

          <div className="relative w-full overflow-clip pt-2">
            <div className="relative max-[767px]:pl-5" aria-roledescription="carousel" aria-label="Mavuus Insights videos">
              <div className="absolute inset-x-0 top-1/4 z-[999] flex items-center justify-between max-[767px]:hidden">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={index === 0}
                  aria-label="Previous slide"
                  className="inline-block cursor-pointer bg-transparent px-1.5 py-px disabled:cursor-default"
                >
                  <ArrowIcon direction="prev" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={index === maxIndex}
                  aria-label="Next slide"
                  className="inline-block cursor-pointer bg-transparent px-1.5 py-px disabled:cursor-default"
                >
                  <ArrowIcon direction="next" />
                </button>
              </div>
              <div
                className="overflow-hidden"
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX
                }}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return
                  const dx = e.changedTouches[0].clientX - touchX.current
                  touchX.current = null
                  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
                }}
              >
                <ul
                  className="m-0 flex w-full list-none p-0 transition-transform duration-[600ms] ease-[cubic-bezier(.25,1,.5,1)]"
                  style={{ transform: `translateX(calc(-1 * ${offset}))`, gap }}
                >
                  {VIDEOS.map((video) => (
                    <li key={video.slug} className="flex-none" style={{ width: `calc${slideWidth}` }}>
                      <VideoCard video={video} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-8 text-center max-[767px]:px-5 max-[767px]:pt-5">
              <OutlineButton to="/resources">Explore Mavuus Insights</OutlineButton>
            </div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
