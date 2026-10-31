import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LiveContainer from '../../components/live/LiveContainer'
import EventsSlider from '../../components/live/resources/EventsSlider'
import { Breadcrumb } from '../../components/live/resources/cards'
import {
  ArrowIcon,
  CalendarIcon,
  CheckIcon,
  FacebookIcon,
  LinkedInIcon,
  LinkIcon,
  XIcon,
} from '../../components/live/resources/icons'
import { LIVE_EVENTS, POSTS, getPost, loadPostBody } from '../../data/live/posts'

const RICH_TEXT = [
  'text-base leading-6 text-dark-blue',
  '[&_p]:mb-4 [&_p]:text-[18px] [&_p]:leading-[28.8px] [&_p]:text-live-grey',
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[28.8px] [&_h2]:leading-[1.2] [&_h2]:font-medium [&_h2]:text-dark-blue',
  '[&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:leading-[33px] [&_h3]:font-medium [&_h3]:text-dark-blue',
  '[&_h4]:mt-8 [&_h4]:mb-4 [&_h4]:text-[20.8px] [&_h4]:leading-[1.4] [&_h4]:font-medium [&_h4]:text-dark-blue',
  '[&_h5]:mt-5 [&_h5]:mb-4 [&_h5]:text-[17.6px] [&_h5]:font-medium',
  '[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:overflow-hidden [&_ul]:pl-6 [&_ul]:text-live-grey',
  '[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:overflow-hidden [&_ol]:pl-6 [&_ol]:text-live-grey',
  '[&_li]:mb-1 [&_li]:text-[18px] [&_li]:leading-[28.8px] [&_li:last-child]:mb-0',
  '[&_a]:text-brand-blue [&_a]:underline [&_strong]:font-bold [&_em]:italic',
  '[&_figure]:relative [&_figure]:mb-4 [&_figure]:h-0 [&_figure]:w-full',
  '[&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full',
  '[&_img]:rounded-2xl [&_table]:mb-4 [&_table]:text-live-grey',
  '[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:pl-5',
].join(' ')

function truncate(text, max = 50) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

function Dot() {
  return <span aria-hidden="true">&bull;</span>
}

function PostHeader({ post }) {
  return (
    <div className="max-w-[768px]">
      <div className="mb-12 flex flex-col items-start max-lg:mb-16 max-md:mb-12">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Resources', to: '/resources' }, { label: truncate(post.title) }]} />
        </div>
        <h1 className="mb-8 text-[28px] leading-[1.2] font-normal text-balance text-dark-blue max-lg:text-[clamp(25px,5vw,48px)] max-md:text-[32px]">
          {post.title}
        </h1>
        <div className="flex items-center max-[479px]:mb-4">
          <img
            src={post.author.image}
            alt={post.author.name}
            className="mr-4 size-14 min-w-14 rounded-full object-cover"
          />
          <div>
            <div className="text-base leading-6 font-semibold text-dark-blue">{post.author.name}</div>
            <div className="mt-1 inline-flex items-center gap-[11.2px] text-[13.6px] leading-5 text-live-grey">
              <span>{post.author.role}</span>
              <Dot />
              <span className="flex gap-[4.8px]">
                <span>{post.readTime}</span>
                <span>min</span>
                <span>read</span>
              </span>
              <Dot />
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareLinks({ title }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const encoded = encodeURIComponent(url)
  const links = [
    { label: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, Icon: FacebookIcon },
    { label: 'Share on X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encoded}`, Icon: XIcon },
    { label: 'Share on LinkedIn', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}`, Icon: LinkedInIcon },
  ]

  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-start max-[479px]:mb-8 max-[479px]:w-full">
      <div className="text-xl leading-[30px] font-semibold text-dark-blue">Share Article</div>
      <div className="mt-4 grid grid-cols-[repeat(4,24px)] gap-6">
        {links.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label}>
            <Icon />
          </a>
        ))}
        <button type="button" onClick={copy} title="Copy link" aria-label={copied ? 'Link copied' : 'Copy link'}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
    </div>
  )
}

function PrevNext({ prev, next }) {
  const empty = (label) => (
    <div>
      <div>{label}</div>
      <Link to="/resources" className="text-brand-blue underline">
        Back to all post
      </Link>
    </div>
  )
  const link = (post) => (
    <Link to={`/post/${post.slug}`} className="text-black no-underline transition-colors duration-300 hover:text-brand-pink">
      {post.title}
    </Link>
  )
  return (
    <div className="mt-16 grid grid-cols-2 gap-4 border border-[#dbe0e7] bg-white max-[479px]:flex max-[479px]:flex-col">
      <div className="flex flex-col items-start gap-4 p-6 text-lg leading-[27px] font-medium text-dark-blue">
        <div className="flex items-center gap-2.5 text-black">
          <ArrowIcon direction="left" className="size-5 text-brand-pink" />
          <span>Previous Article</span>
        </div>
        {prev ? link(prev) : empty('There is no previous post')}
      </div>
      <div className="flex flex-col items-end gap-4 p-6 text-right text-lg leading-[27px] font-medium text-dark-blue max-[479px]:items-start max-[479px]:text-left">
        <div className="flex items-center gap-2.5 text-black">
          <span>Next Article</span>
          <ArrowIcon className="size-5 text-brand-pink" />
        </div>
        {next ? link(next) : empty('There is no next post')}
      </div>
    </div>
  )
}

function OtherArticles({ posts }) {
  return (
    <div className="sticky top-[140px] mb-8 max-lg:relative max-lg:top-auto">
      <h3 className="mb-8 text-2xl leading-[33px] font-medium text-dark-blue">Other Articles</h3>
      <div className="flex flex-col gap-[19.2px] max-lg:pb-12">
        {posts.map((post) => (
          <div key={post.slug} className="flex items-center gap-4">
            <Link to={`/post/${post.slug}`} className="shrink-0">
              <img
                src={post.thumbnail}
                alt={post.title}
                loading="lazy"
                className="aspect-square w-24 rounded-md object-cover"
              />
            </Link>
            <div className="flex flex-col gap-4">
              <Link to={`/post/${post.slug}`} className="text-dark-blue no-underline">
                <div className="text-base leading-6 font-medium text-dark-blue">{truncate(post.title)}</div>
              </Link>
              <div className="mb-2 flex items-center gap-2 text-sm leading-[21px] font-semibold text-live-grey">
                <CalendarIcon className="size-4 shrink-0 text-[#da1e7f]" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <LiveContainer innerClassName="py-24">
      <div className="py-16 text-center">
        <h1 className="mb-4 text-dark-blue">Article not found</h1>
        <p className="mb-8">The article you are looking for does not exist or has moved.</p>
        <Link to="/resources" className="font-semibold text-brand-blue underline">
          Back to Resources
        </Link>
      </div>
    </LiveContainer>
  )
}

export default function PostPage() {
  const { slug } = useParams()
  const post = getPost(slug)
  const [body, setBody] = useState({ slug: null, html: '' })

  useEffect(() => {
    document.title = post ? post.metaTitle : 'Article not found - Mavuus'
  }, [post])

  useEffect(() => {
    if (!post) return undefined
    let active = true
    loadPostBody(post.slug).then((html) => {
      if (active) setBody({ slug: post.slug, html })
    })
    return () => {
      active = false
    }
  }, [post])

  if (!post) return <NotFound />

  const index = POSTS.indexOf(post)
  const prev = POSTS[index - 1]
  const next = POSTS[index + 1]
  const others = POSTS.filter((p) => p !== post).slice(0, 4)
  const html = body.slug === post.slug ? body.html : ''

  return (
    <div>
      <LiveContainer innerClassName="py-24">
        <div className="pt-16">
          <div className="grid grid-cols-[2.5fr_1fr] gap-16 border-b-2 border-[#dbe0e7] max-lg:flex max-lg:flex-col">
            <div className="min-w-0">
              <PostHeader post={post} />
              <div className="mb-14 max-lg:mb-12">
                <img
                  src={post.heroImage}
                  srcSet={post.heroSrcset || undefined}
                  sizes="(max-width: 479px) 92vw, (max-width: 767px) 95vw, (max-width: 991px) 92vw, 61vw"
                  alt={post.title}
                  className="aspect-[2] h-full w-full rounded-2xl object-cover"
                />
              </div>
              <div className="pb-32 max-lg:pb-24">
                <div className={`mb-16 max-lg:mb-12 max-md:mb-8 ${html ? '' : 'min-h-[50vh]'}`}>
                  <div className={RICH_TEXT} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
                <ShareLinks title={post.title} />
                <PrevNext prev={prev} next={next} />
              </div>
            </div>
            <div>
              <OtherArticles posts={others} />
            </div>
          </div>
        </div>
      </LiveContainer>
      <EventsSlider events={LIVE_EVENTS} />
    </div>
  )
}
