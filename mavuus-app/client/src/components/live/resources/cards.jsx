import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, ChevronRight, Clock, FileText, MapPin, Play, Tag } from 'lucide-react'
import LiveButton from '../LiveButton'
import MediaFrame from '../ui/MediaFrame'
import Reveal from '../ui/Reveal'
import { H_CARD, H_SECTION, LEAD } from '../ui/Typography'
import { srcSetFor } from '../../../data/live/posts'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' }

export const CARD_SIZES = '(max-width: 479px) 80vw, (max-width: 991px) 45vw, 405px'

const TITLE_HOVER = 'transition-colors duration-300 group-hover:text-brand-pink group-focus-visible:text-brand-pink'

export function MetaItem({ icon: Icon, accent = false, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] leading-5 font-semibold tracking-[0.08em] uppercase ${
        accent ? 'text-brand-blue' : 'text-live-muted'
      }`}
    >
      <Icon size={15} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {children}
    </span>
  )
}

export function MetaRow({ children, className = '' }) {
  return <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>{children}</div>
}

export function ArticleMeta({ post, label = true }) {
  return (
    <MetaRow>
      {label && <MetaItem icon={FileText} accent>Article</MetaItem>}
      <MetaItem icon={Clock}>{post.readTime} min read</MetaItem>
      {post.category && <MetaItem icon={Tag}>{post.category}</MetaItem>}
    </MetaRow>
  )
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="w-full min-w-0">
      <ol className="m-0 flex list-none items-center p-0 text-base leading-6 text-dark-blue">
        {items.map((item, i) => (
          <li key={item.label} className={`flex min-h-11 items-center ${item.to ? 'shrink-0' : 'min-w-0'}`}>
            {i > 0 && <ChevronRight size={16} aria-hidden="true" className="mx-2 shrink-0 text-live-muted" />}
            {item.to ? (
              <Link to={item.to} className="flex min-h-11 items-center text-dark-blue no-underline transition-colors hover:text-brand-pink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function SignUpLink({ count, noun }) {
  return (
    <Link
      to="/register"
      className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-base leading-6 font-medium sm:whitespace-nowrap text-dark-blue no-underline transition-colors duration-300 hover:text-brand-pink"
    >
      <span>
        Sign Up to get access to all <span className="text-brand-pink">{count}</span> {noun}
      </span>
      <ArrowUpRight size={20} aria-hidden="true" className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}

export function SectionHeader({ title, intro, count, noun }) {
  return (
    <Reveal className="mb-10 flex items-end justify-between gap-x-8 gap-y-4 max-[767px]:mb-8 max-[991px]:flex-col max-[991px]:items-start">
      <div className="flex max-w-[736px] flex-col gap-3">
        <h2 className={H_SECTION}>{title}</h2>
        {intro && <p className={`${LEAD} m-0 [text-wrap:pretty]`}>{intro}</p>}
      </div>
      {noun && <SignUpLink count={count} noun={noun} />}
    </Reveal>
  )
}

// 3 columns on desktop; a swipeable row below 992px so no card is ever left alone on a row.
export const LIST_CLASSES =
  'grid grid-cols-3 gap-x-8 gap-y-14 max-[991px]:-mx-10 max-[991px]:flex max-[991px]:snap-x max-[991px]:snap-mandatory max-[991px]:gap-6 max-[991px]:overflow-x-auto max-[991px]:scroll-px-10 max-[991px]:px-10 max-[991px]:pb-4 max-[767px]:-mx-5 max-[767px]:scroll-px-5 max-[767px]:px-5'

export const ITEM_CLASSES = 'max-[991px]:w-[42%] max-[991px]:flex-none max-[991px]:snap-start max-[767px]:w-[80%]'

export function CardGrid({ children }) {
  return <div className={LIST_CLASSES}>{children}</div>
}

export function GridItem({ index, children }) {
  return (
    <Reveal index={index % 3} className={ITEM_CLASSES}>
      {children}
    </Reveal>
  )
}

export function ArticleCard({ post }) {
  return (
    <Link to={`/post/${post.slug}`} className="group flex h-full flex-col gap-4 rounded-2xl no-underline">
      <MediaFrame src={post.thumbnail} srcSet={srcSetFor(post.thumbnail)} sizes={CARD_SIZES} className="mb-2" />
      <ArticleMeta post={post} />
      <h3 className={`${H_CARD} ${TITLE_HOVER}`}>{post.title}</h3>
      <p className="m-0 text-base leading-6 text-live-grey">By {post.author.name}</p>
    </Link>
  )
}

export function PlayBadge({ large = false }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-dark-blue/45 text-white transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 ${
        large ? 'size-20 max-[767px]:size-14' : 'size-14'
      }`}
    >
      <Play size={large ? 30 : 22} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
    </span>
  )
}

export function SignUpOverlay() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center p-6 opacity-0 transition-opacity duration-300 ease-[var(--ease-live)] group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span className="max-w-[240px] rounded-2xl bg-brand-pink/95 p-4 text-center text-base leading-6 font-medium text-white">
        Sign Up for Mavuus to get access to all videos
      </span>
    </span>
  )
}

export function VideoCard({ video }) {
  return (
    <Link to={`/demands-videos/${video.slug}`} className="group flex h-full flex-col gap-4 rounded-2xl no-underline">
      <MediaFrame src={video.thumbnail} srcSet={srcSetFor(video.thumbnail)} sizes={CARD_SIZES} className="mb-2">
        <span aria-hidden="true" className="absolute inset-0 bg-dark-blue/15" />
        <PlayBadge />
        <SignUpOverlay />
      </MediaFrame>
      <MetaRow>
        <MetaItem icon={Play} accent>Video</MetaItem>
      </MetaRow>
      <h3 className={`${H_CARD} ${TITLE_HOVER}`}>{video.title}</h3>
    </Link>
  )
}

function EventMeta({ event }) {
  return (
    <MetaRow>
      {event.date && <MetaItem icon={Calendar}>{event.date}</MetaItem>}
      {event.type && <MetaItem icon={MapPin}>{event.type}</MetaItem>}
    </MetaRow>
  )
}

function SmartLink({ href, className, children, ...props }) {
  if (href.startsWith('http')) {
    return (
      <a href={href} {...EXTERNAL} className={className} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className} {...props}>
      {children}
    </Link>
  )
}

/**
 * layout="stack" for grids and sliders, "wide" when an event is shown on its own.
 * href is where the image and title go; RSVP always opens the event page.
 */
export function EventCard({ event, href = event.url, layout = 'stack', sizes = CARD_SIZES }) {
  const wide = layout === 'wide'
  return (
    <div
      className={`group h-full ${
        wide ? 'grid grid-cols-[1.15fr_1fr] items-center gap-12 max-[991px]:gap-8 max-[767px]:flex max-[767px]:flex-col max-[767px]:items-stretch max-[767px]:gap-6' : 'flex flex-col gap-4'
      }`}
    >
      <SmartLink href={href} tabIndex={-1} aria-hidden="true" className={`block rounded-2xl ${wide ? '' : 'mb-2'}`}>
        <MediaFrame src={event.image} srcSet={srcSetFor(event.image)} sizes={sizes} />
      </SmartLink>
      <div className={`flex grow flex-col ${wide ? 'gap-5' : 'gap-4'}`}>
        <EventMeta event={event} />
        <SmartLink href={href} className="rounded-sm text-dark-blue no-underline">
          <h3 className={`${H_CARD} ${TITLE_HOVER}`}>{event.title}</h3>
        </SmartLink>
        <p className="m-0 text-base leading-[1.7] text-live-grey">{event.description}</p>
        <LiveButton
          href={event.url}
          {...EXTERNAL}
          variant="outline"
          className={`whitespace-nowrap ${wide ? 'mt-2 self-start' : 'mt-auto w-full'}`}
        >
          RSVP Now
        </LiveButton>
      </div>
    </div>
  )
}

export function LoadMoreButton({ onClick }) {
  return (
    <div className="mt-12 flex justify-center max-[991px]:mt-8">
      <LiveButton variant="outline" onClick={onClick}>
        Load More
      </LiveButton>
    </div>
  )
}
