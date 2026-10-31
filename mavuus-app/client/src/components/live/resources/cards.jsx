import { Link } from 'react-router-dom'
import { ArrowBoxIcon, CalendarIcon, ChevronIcon, ClockIcon, PinIcon, PlayIcon, TagIcon } from './icons'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' }

export function MetaItem({ icon: Icon, children }) {
  return (
    <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold leading-[21px] text-live-grey">
      <Icon className="size-4 shrink-0" />
      {children ? <span className="flex items-center gap-[4.8px]">{children}</span> : null}
    </span>
  )
}

export function ReadTime({ minutes }) {
  return (
    <MetaItem icon={ClockIcon}>
      <span>{minutes}</span>
      <span>min</span>
      <span>reading</span>
    </MetaItem>
  )
}

export function MetaRow({ children }) {
  return <div className="flex flex-wrap items-center gap-x-[22.4px]">{children}</div>
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-base leading-6 text-dark-blue">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center">
          {i > 0 && <ChevronIcon className="mx-2 size-4 shrink-0" />}
          {item.to ? (
            <Link to={item.to} className="text-dark-blue no-underline">
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? 'font-semibold' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function SectionHeader({ title, ctaText, count }) {
  return (
    <div className="flex items-center justify-between max-[479px]:flex-col max-[479px]:items-start max-[479px]:gap-4">
      <h2 className="text-[32px] leading-[38.4px] font-medium text-dark-blue">{title}</h2>
      {ctaText && (
        <Link
          to="/register"
          className="flex items-center gap-2 text-base leading-6 text-dark-blue no-underline transition-colors duration-300 hover:text-live-grey"
        >
          <span>
            Sign Up to get access to all <span className="text-brand-pink">{count}</span> {ctaText}
          </span>
          <ArrowBoxIcon className="size-6 shrink-0" />
        </Link>
      )}
    </div>
  )
}

export const LIST_CLASSES =
  'grid grid-cols-3 gap-x-8 gap-y-16 border-b border-[#dbe0e7] pb-16 max-lg:grid-cols-2 max-md:-mx-5 max-md:flex max-md:gap-x-8 max-md:overflow-x-auto max-md:px-5'

const ITEM_CLASSES = 'flex flex-col items-start gap-[12.8px] max-md:w-[30rem] max-md:flex-none max-[479px]:w-[80vw]!'

export const OUTLINE_BUTTON =
  'flex items-center justify-center rounded-2xl border border-black px-8 py-4 text-center font-semibold text-black no-underline transition-all duration-300 hover:border-brand-pink hover:text-brand-pink'

function CardImage({ src, alt, eager = false, children }) {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl">
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        className="aspect-[3/2] h-full w-full rounded-2xl object-cover transition-transform duration-500 group-hover/card:scale-105"
      />
      {children}
    </div>
  )
}

function CardTitle({ children, className = 'text-dark-blue' }) {
  return <h3 className={`text-[22px] leading-[26.4px] font-medium ${className}`}>{children}</h3>
}

export function ArticleCard({ post, eager = false }) {
  const to = `/post/${post.slug}`
  return (
    <div className={`group/card ${ITEM_CLASSES}`}>
      <Link to={to} className="mb-6 block w-full" aria-label={post.title}>
        <CardImage src={post.thumbnail} alt={post.title} eager={eager} />
      </Link>
      <MetaRow>
        <ReadTime minutes={post.readTime} />
        <MetaItem icon={TagIcon}>{post.category ? <span>{post.category}</span> : null}</MetaItem>
      </MetaRow>
      <Link to={to} className="mb-2 block w-full no-underline">
        <CardTitle>{post.title}</CardTitle>
      </Link>
      <div className="flex gap-[3.2px] text-base leading-6 text-live-grey">
        <span>By</span>
        <span>{post.author.name}</span>
      </div>
    </div>
  )
}

export function VideoCard({ video }) {
  const to = `/demands-videos/${video.slug}`
  return (
    <div className={`group/card pb-[12.8px] ${ITEM_CLASSES}`}>
      <Link to={to} className="mb-6 block w-full" aria-label={video.title}>
        <CardImage src={video.thumbnail} alt={video.title}>
          <span className="absolute z-[2] flex translate-y-[300%] items-center justify-center rounded-2xl bg-[#f26d92eb] p-4 text-center text-base leading-6 font-medium text-white transition-transform duration-500 group-hover/card:translate-y-0">
            Sign Up for Mavuus to get
            <br />
            access to all videos
          </span>
          <span className="absolute flex size-12 items-center justify-center rounded-full border border-white bg-white/20 text-white backdrop-blur-[15px] transition-opacity duration-300 group-hover/card:opacity-0">
            <PlayIcon className="relative left-0.5 size-[21px]" />
          </span>
        </CardImage>
      </Link>
      <Link to={to} className="mb-2 block w-full no-underline">
        <CardTitle>{video.title}</CardTitle>
      </Link>
    </div>
  )
}

export function EventCard({ event, imageHref = event.url, className = ITEM_CLASSES }) {
  const imageIsExternal = imageHref.startsWith('http')
  const imageProps = imageIsExternal ? { href: imageHref, ...EXTERNAL } : null
  const ImageLink = imageIsExternal ? 'a' : Link
  return (
    <div className={`group/card min-h-[36rem] justify-between ${className}`}>
      <div className="w-full">
        <ImageLink {...(imageProps ?? { to: imageHref })} className="mb-6 block w-full" aria-label={event.title}>
          <CardImage src={event.image} alt={event.title} />
        </ImageLink>
        <MetaRow>
          <MetaItem icon={CalendarIcon}>{event.date ? <span>{event.date}</span> : null}</MetaItem>
          <MetaItem icon={PinIcon}>
            <span>{event.type}</span>
          </MetaItem>
        </MetaRow>
        <ImageLink {...(imageProps ?? { to: imageHref })} className="mb-2 block no-underline">
          <CardTitle className="text-black">{event.title}</CardTitle>
        </ImageLink>
        <p className="text-base leading-6 text-live-grey">{event.description}</p>
      </div>
      <a href={event.url} {...EXTERNAL} className={`${OUTLINE_BUTTON} w-full text-base leading-6`}>
        RSVP Now
      </a>
    </div>
  )
}

export function LoadMoreButton({ onClick }) {
  return (
    <div className="flex justify-center">
      <button type="button" onClick={onClick} className={`${OUTLINE_BUTTON} mt-12 text-sm leading-[21px] max-lg:mt-10 max-md:mt-6 max-md:w-full`}>
        Load More
      </button>
    </div>
  )
}
