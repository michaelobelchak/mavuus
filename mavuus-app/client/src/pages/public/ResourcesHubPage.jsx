import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LiveContainer from '../../components/live/LiveContainer'
import {
  ArticleCard,
  Breadcrumb,
  EventCard,
  LIST_CLASSES,
  LoadMoreButton,
  MetaItem,
  MetaRow,
  ReadTime,
  SectionHeader,
  VideoCard,
} from '../../components/live/resources/cards'
import { TagIcon } from '../../components/live/resources/icons'
import { LIVE_EVENTS, POSTS } from '../../data/live/posts'
import { VIDEOS } from '../../data/live/videos'

const PAGE_SIZE = 9

function FeaturedPost({ post }) {
  const to = `/post/${post.slug}`
  return (
    <div className="grid grid-cols-[1.25fr_1fr] items-start gap-12 max-md:grid-cols-1 max-md:gap-6">
      <Link to={to} className="block w-full">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="aspect-video h-full w-full rounded-2xl object-cover"
        />
      </Link>
      <div className="flex h-full flex-col items-start justify-center gap-[19.2px]">
        <div className="flex flex-col gap-4">
          <MetaRow>
            <ReadTime minutes={post.readTime} />
            <MetaItem icon={TagIcon}>{post.category ? <span>{post.category}</span> : null}</MetaItem>
          </MetaRow>
          <Link to={to} className="mb-4 block text-dark-blue no-underline">
            <h2 className="text-[40px] leading-[48px] font-medium text-dark-blue transition-colors hover:text-brand-pink">
              {post.title}
            </h2>
          </Link>
          <Link to={to} className="text-base leading-6 font-semibold text-brand-pink no-underline">
            Learn More
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <img
            src={post.author.image}
            alt={post.author.name}
            className="mr-4 size-12 min-w-12 rounded-full object-cover"
          />
          <div>
            <div className="text-xl leading-[30px] font-semibold text-dark-blue">{post.author.name}</div>
            <div className="flex h-6 items-center text-[13.6px] leading-5 text-live-grey">{post.author.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResourcesHubPage() {
  const [articleCount, setArticleCount] = useState(PAGE_SIZE)
  const [videoCount, setVideoCount] = useState(PAGE_SIZE)

  useEffect(() => {
    document.title = 'Resources | Events, Articles, On-Demand Videos - Mavuus'
  }, [])

  const articles = POSTS.slice(0, articleCount)
  const videos = VIDEOS.slice(0, videoCount)
  const events = LIVE_EVENTS.slice(0, 1)

  return (
    <header>
      <LiveContainer innerClassName="py-24">
        <div className="py-16 max-md:pt-8">
          <div className="mb-12 max-w-[768px] max-lg:mb-10 max-md:mb-6">
            <div className="mb-6">
              <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources', current: true }]} />
            </div>
            <h1 className="text-dark-blue">Helpful Resources</h1>
          </div>

          <FeaturedPost post={POSTS[0]} />

          <div className="mt-24 flex flex-col gap-8">
            <SectionHeader title="Live Events" ctaText="Events" count={events.length} />
            <div className={LIST_CLASSES}>
              {events.map((event) => (
                <EventCard key={event.url} event={event} />
              ))}
            </div>
          </div>

          <div className="mt-24 flex flex-col gap-8">
            <SectionHeader title="Articles" />
            <div>
              <div className={LIST_CLASSES}>
                {articles.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
              {articleCount < POSTS.length && (
                <LoadMoreButton onClick={() => setArticleCount((n) => n + PAGE_SIZE)} />
              )}
            </div>
          </div>

          <div className="mt-24 flex flex-col gap-8">
            <SectionHeader title="On Demand Videos" ctaText="Demand Videos" count={videos.length} />
            <div>
              <div className={LIST_CLASSES}>
                {videos.map((video) => (
                  <VideoCard key={video.slug} video={video} />
                ))}
              </div>
              {videoCount < VIDEOS.length && (
                <LoadMoreButton onClick={() => setVideoCount((n) => n + PAGE_SIZE)} />
              )}
            </div>
          </div>
        </div>
      </LiveContainer>
    </header>
  )
}
