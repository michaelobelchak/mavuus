import { useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import LiveButton from '../LiveButton'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import MediaFrame from '../ui/MediaFrame'
import { H_CARD, H_SECTION, Highlight, LEAD, SECTION_HEAD } from '../ui/Typography'
import { VIDEOS } from '../../../data/live/videos'
import { VIDEO_THUMB_WIDTHS } from '../../../data/live/home'

// Slides per view and gap at each breakpoint, from the live Splide settings.
const LAYOUTS = [
  { query: '(max-width: 479px)', perPage: 1.2, gap: '3vw' },
  { query: '(max-width: 767px)', perPage: 2.1, gap: '3vw' },
  { query: '(max-width: 991px)', perPage: 2, gap: '3vw' },
]
const DESKTOP = { perPage: 3, gap: '2em' }
const SIZES = '(max-width: 479px) 80vw, (max-width: 991px) 48vw, 405px'

function subscribe(callback) {
  const lists = LAYOUTS.map((l) => window.matchMedia(l.query))
  lists.forEach((l) => l.addEventListener('change', callback))
  return () => lists.forEach((l) => l.removeEventListener('change', callback))
}

const getLayoutIndex = () => LAYOUTS.findIndex((l) => window.matchMedia(l.query).matches)

function srcSetFor(video) {
  const widths = VIDEO_THUMB_WIDTHS[video.slug]
  if (!widths) return undefined
  const dot = video.thumbnail.lastIndexOf('.')
  const base = video.thumbnail.slice(0, dot)
  const ext = video.thumbnail.slice(dot)
  const full = widths[widths.length - 1]
  return [...widths.slice(0, -1).map((w) => `${base}-p-${w}${ext} ${w}w`), `${video.thumbnail} ${full}w`].join(', ')
}

function VideoCard({ video }) {
  return (
    <Link to="/register" className="group flex flex-col gap-5 rounded-2xl no-underline">
      <MediaFrame src={video.thumbnail} srcSet={srcSetFor(video)} sizes={SIZES} className="flex items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full border border-white/70 bg-dark-blue/45 text-white transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
        >
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-brand-pink/90 p-6 text-center text-base leading-6 font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          <span className="max-w-[200px]">Sign Up for Mavuus to get access to all videos</span>
        </span>
      </MediaFrame>
      <h3 className={`${H_CARD} m-0 transition-colors duration-300 group-hover:text-brand-blue`}>{video.title}</h3>
    </Link>
  )
}

function ArrowButton({ direction, onClick, disabled }) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous videos' : 'Next videos'}
      className="flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-dark-blue bg-white/90 text-dark-blue transition-[background-color,color,opacity] duration-200 hover:bg-dark-blue hover:text-white disabled:pointer-events-none disabled:opacity-0"
    >
      <Icon size={20} strokeWidth={2} />
    </button>
  )
}

export default function InsightsSlider() {
  const layoutIndex = useSyncExternalStore(subscribe, getLayoutIndex, () => -1)
  const { perPage, gap } = layoutIndex === -1 ? DESKTOP : LAYOUTS[layoutIndex]
  const count = VIDEOS.length
  const maxIndex = Math.max(0, Math.ceil(count - perPage))
  const [rawIndex, setIndex] = useState(0)
  const index = Math.min(rawIndex, maxIndex)
  const touchX = useRef(null)

  const go = (delta) => setIndex(Math.max(0, Math.min(maxIndex, index + delta)))

  const slideWidth = `((100% - ${perPage - 1} * ${gap}) / ${perPage})`
  const overflow = `(${count} * ${slideWidth} + ${count - 1} * ${gap} - 100%)`
  const offset = `min(${index} * (${slideWidth} + ${gap}), ${overflow})`

  // The first slide shown, in slide units (the last page is pinned to the end of the track).
  const start = Math.min(index, count - perPage)
  const fullyVisible = (i) => i >= start - 0.001 && i + 1 <= start + perPage + 0.001
  const rendered = (i) => i >= Math.floor(start) - 1 && i <= Math.ceil(start + perPage)

  return (
    <Section className="overflow-hidden">
      <Reveal className={`${SECTION_HEAD} mb-14 max-[767px]:mb-8`}>
        <h2 className={`${H_SECTION} m-0`}>
          Mavuus <Highlight>Insights</Highlight>: Conversations That Shape Better <Highlight>Marketing</Highlight> Decisions
        </h2>
        <p className={`${LEAD} m-0`}>
          Explore expert perspectives and conversations on marketing strategy, business growth, leadership and the
          challenges shaping today&apos;s marketing landscape.
        </p>
        <p className={`${LEAD} m-0`}>
          Whether you&apos;re a business executive looking to make smarter marketing investments or a marketing leader
          navigating an evolving role, our conversations bring together practical insights and real-world experiences.
        </p>
      </Reveal>

      <Reveal className="max-[767px]:-mx-5">
        <div className="relative max-[767px]:pl-5" role="region" aria-roledescription="carousel" aria-label="Mavuus Insights videos">
          <div className="pointer-events-none absolute inset-x-0 top-[35%] z-10 -translate-y-1/2 flex items-center justify-between px-3 max-[767px]:hidden [&>*]:pointer-events-auto">
            <ArrowButton direction="prev" onClick={() => go(-1)} disabled={index === 0} />
            <ArrowButton direction="next" onClick={() => go(1)} disabled={index === maxIndex} />
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
              className="m-0 flex w-full list-none p-0 transition-transform duration-[600ms] ease-[var(--ease-live)] motion-reduce:transition-none"
              style={{ transform: `translateX(calc(-1 * ${offset}))`, gap }}
            >
              {VIDEOS.map((video, i) => {
                const visible = fullyVisible(i)
                return (
                  <li
                    key={video.slug}
                    className="flex-none"
                    style={{ width: `calc${slideWidth}` }}
                    inert={!visible}
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${count}`}
                  >
                    {rendered(i) && <VideoCard video={video} />}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </Reveal>

      <div className="flex justify-center pt-10 max-[767px]:pt-6">
        <LiveButton to="/resources" variant="outline" className="whitespace-nowrap">
          Explore Mavuus Insights
        </LiveButton>
      </div>
    </Section>
  )
}
