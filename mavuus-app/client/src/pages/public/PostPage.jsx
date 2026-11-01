import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Check, Link as LinkGlyph } from 'lucide-react'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import MediaFrame from '../../components/live/ui/MediaFrame'
import { cardClass } from '../../components/live/ui/cardStyles'
import { H_CARD, H_PAGE, H_SMALL } from '../../components/live/ui/Typography'
import EventsSlider from '../../components/live/resources/EventsSlider'
import { Breadcrumb, MetaItem } from '../../components/live/resources/cards'
import { FacebookIcon, LinkedInIcon, XIcon } from '../../components/live/resources/icons'
import { LIVE_EVENTS, POSTS, getPost, loadPostBody, srcSetFor } from '../../data/live/posts'

const RICH_TEXT = [
  'max-w-[70ch] text-lg leading-[1.75] text-live-grey',
  '[&_p]:mb-5 [&_p]:text-lg [&_p]:leading-[1.75] [&_p]:text-live-grey',
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[28px] [&_h2]:leading-[1.25] [&_h2]:font-medium [&_h2]:text-dark-blue',
  '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-[22px] [&_h3]:leading-[1.3] [&_h3]:font-medium [&_h3]:text-dark-blue',
  '[&_:is(h4,h5,h6)]:mt-8 [&_:is(h4,h5,h6)]:mb-3 [&_:is(h4,h5,h6)]:text-lg [&_:is(h4,h5,h6)]:leading-[1.4] [&_:is(h4,h5,h6)]:font-semibold [&_:is(h4,h5,h6)]:text-dark-blue',
  '[&_:is(h2,h3,h4,h5,h6)_strong]:[font-weight:inherit] [&>:first-child]:mt-0',
  '[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-2 [&_li]:text-lg [&_li]:leading-[1.75] [&_li]:text-live-grey [&_li::marker]:text-brand-pink',
  '[&_a]:text-brand-blue [&_a]:underline [&_a:hover]:text-brand-pink [&_strong]:font-semibold [&_strong]:text-dark-blue [&_a_strong]:[color:inherit] [&_em]:italic',
  '[&_figure]:relative [&_figure]:my-8 [&_figure]:h-0 [&_figure]:w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full [&_iframe]:rounded-2xl',
  '[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_figcaption]:mt-3 [&_figcaption]:text-sm [&_figcaption]:text-live-muted',
  '[&_table]:mb-6 [&_table]:w-full [&_table]:text-base [&_td]:border-b [&_td]:border-live-hairline [&_td]:py-2 [&_td]:pr-4',
  '[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-live-pink-200 [&_blockquote]:pl-6 [&_blockquote]:text-dark-blue',
].join(' ')

const ICON_BUTTON =
  'flex size-11 cursor-pointer items-center justify-center rounded-full text-dark-blue transition-colors duration-200 hover:bg-live-blue-light hover:text-brand-pink'

const TEXT_LINK = 'inline-flex min-h-11 items-center no-underline transition-colors duration-300'

function truncate(text, max = 50) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

function PostHeader({ post }) {
  return (
    <Reveal className="mb-10 flex max-w-[800px] flex-col items-start gap-4 max-[767px]:mb-8">
      <Breadcrumb items={[{ label: 'Resources', to: '/resources' }, { label: truncate(post.title) }]} />
      <h1 className={H_PAGE}>{post.title}</h1>
      <div className="mt-4 flex items-center gap-4">
        <img
          src={post.author.image}
          alt=""
          width="56"
          height="56"
          className="size-14 shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-col gap-1">
          <span className="text-base leading-6 font-semibold text-dark-blue">{post.author.name}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-live-grey">
            <span className="max-[479px]:w-full">{post.author.role}</span>
            <span aria-hidden="true" className="max-[479px]:hidden">&bull;</span>
            <span>{post.readTime} min read</span>
            <span aria-hidden="true">&bull;</span>
            <span>{post.date}</span>
          </span>
        </div>
      </div>
    </Reveal>
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
    <div className="flex flex-col items-start gap-3">
      <p className={`${H_SMALL} m-0`}>Share Article</p>
      <div className="-ml-2.5 flex gap-2">
        {links.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={ICON_BUTTON}>
            <Icon />
          </a>
        ))}
        <button type="button" onClick={copy} aria-label={copied ? 'Link copied' : 'Copy link'} className={ICON_BUTTON}>
          {copied ? <Check size={22} aria-hidden="true" /> : <LinkGlyph size={22} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

function PrevNextItem({ post, direction }) {
  const isNext = direction === 'next'
  const Arrow = isNext ? ArrowRight : ArrowLeft
  return (
    <div className={`flex flex-col gap-2 p-6 ${isNext ? 'items-end text-right max-[479px]:items-start max-[479px]:text-left' : 'items-start'}`}>
      <span className={`flex items-center gap-2 text-base leading-6 font-medium text-dark-blue ${isNext ? 'flex-row-reverse' : ''}`}>
        <Arrow size={20} aria-hidden="true" className="text-brand-pink" />
        {isNext ? 'Next Article' : 'Previous Article'}
      </span>
      {post ? (
        <Link to={`/post/${post.slug}`} className={`${TEXT_LINK} text-lg leading-[1.4] font-medium text-dark-blue hover:text-brand-pink`}>
          {post.title}
        </Link>
      ) : (
        <>
          <span className="text-base leading-6 text-live-grey">{isNext ? 'There is no next post' : 'There is no previous post'}</span>
          <Link to="/resources" className={`${TEXT_LINK} text-base text-brand-blue underline hover:text-brand-pink`}>
            Back to all post
          </Link>
        </>
      )}
    </div>
  )
}

function PrevNext({ prev, next }) {
  return (
    <nav
      aria-label="More articles"
      className={cardClass({
        variant: 'surface',
        className: 'mt-12 grid grid-cols-2 divide-x divide-live-hairline max-[479px]:grid-cols-1 max-[479px]:divide-x-0 max-[479px]:divide-y',
      })}
    >
      <PrevNextItem post={prev} direction="prev" />
      <PrevNextItem post={next} direction="next" />
    </nav>
  )
}

function OtherArticles({ posts }) {
  return (
    <aside aria-labelledby="other-articles" className={cardClass({ variant: 'surface', className: 'sticky top-[140px] p-6 max-[991px]:static' })}>
      <h2 id="other-articles" className={`${H_CARD} mb-2`}>Other Articles</h2>
      <ul className="m-0 flex list-none flex-col divide-y divide-live-hairline p-0 max-[991px]:grid max-[991px]:grid-cols-2 max-[991px]:gap-x-8 max-[991px]:divide-y-0 max-[767px]:grid-cols-1 max-[767px]:divide-y">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/post/${post.slug}`} className="group flex items-center gap-4 rounded-2xl py-4 no-underline">
              <MediaFrame
                src={post.thumbnail}
                srcSet={srcSetFor(post.thumbnail)}
                sizes="96px"
                className="w-24 shrink-0"
              />
              <span className="flex min-w-0 flex-col gap-2">
                <span className="text-base leading-[1.4] font-medium text-dark-blue transition-colors duration-300 group-hover:text-brand-pink">
                  {truncate(post.title, 60)}
                </span>
                <MetaItem icon={Calendar}>{post.date}</MetaItem>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function NotFound() {
  return (
    <Section>
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className={H_PAGE}>Article not found</h1>
        <p className="m-0">The article you are looking for does not exist or has moved.</p>
        <Link to="/resources" className={`${TEXT_LINK} font-semibold text-brand-blue underline hover:text-brand-pink`}>
          Back to Resources
        </Link>
      </div>
    </Section>
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
    <>
      <Section spacing="compact">
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-16 max-[1199px]:grid-cols-[minmax(0,1fr)_300px] max-[1199px]:gap-12 max-[991px]:grid-cols-1">
          <article className="min-w-0">
            <PostHeader post={post} />
            <Reveal variant="clip" className="mb-12 max-[767px]:mb-8">
              <img
                src={post.heroImage}
                srcSet={post.heroSrcset || undefined}
                sizes="(max-width: 767px) 92vw, (max-width: 991px) 90vw, 800px"
                alt=""
                className="aspect-[2] w-full rounded-3xl bg-live-blue-light object-cover max-[767px]:rounded-2xl"
              />
            </Reveal>
            <div className={`mb-12 ${html ? '' : 'min-h-[50vh]'}`}>
              <div className={RICH_TEXT} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
            <ShareLinks title={post.title} />
            <PrevNext prev={prev} next={next} />
          </article>
          <OtherArticles posts={others} />
        </div>
      </Section>
      <EventsSlider events={LIVE_EVENTS} />
    </>
  )
}
