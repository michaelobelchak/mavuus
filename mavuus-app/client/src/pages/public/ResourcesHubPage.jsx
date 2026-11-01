import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import MediaFrame from '../../components/live/ui/MediaFrame'
import { H_PAGE, H_SECTION } from '../../components/live/ui/Typography'
import {
  ArticleCard,
  ArticleMeta,
  Breadcrumb,
  CardGrid,
  EventCard,
  GridItem,
  LoadMoreButton,
  SectionHeader,
  VideoCard,
} from '../../components/live/resources/cards'
import { LIVE_EVENTS, POSTS, srcSetFor } from '../../data/live/posts'
import { VIDEOS } from '../../data/live/videos'

const PAGE_SIZE = 9

function FeaturedPost({ post }) {
  const to = `/post/${post.slug}`
  return (
    <div className="grid grid-cols-[1.25fr_1fr] items-center gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-8">
      <Reveal variant="clip">
        <Link to={to} tabIndex={-1} aria-hidden="true" className="group block rounded-2xl">
          <MediaFrame
            src={post.thumbnail}
            srcSet={srcSetFor(post.thumbnail)}
            sizes="(max-width: 991px) 92vw, 700px"
            ratio="aspect-video"
            eager
          />
        </Link>
      </Reveal>
      <Reveal index={1} className="flex flex-col items-start gap-5">
        <ArticleMeta post={post} />
        <Link to={to} className="text-dark-blue no-underline">
          <h2 className={`${H_SECTION} transition-colors duration-300 hover:text-brand-pink`}>{post.title}</h2>
        </Link>
        <Link
          to={to}
          className="group inline-flex min-h-11 items-center gap-2 text-base leading-6 font-semibold text-brand-pink no-underline"
        >
          Learn More
          <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <div className="mt-2 flex items-center gap-4">
          <img
            src={post.author.image}
            alt=""
            width="48"
            height="48"
            className="size-12 shrink-0 rounded-full object-cover"
          />
          <div>
            <div className="text-lg leading-7 font-semibold text-dark-blue">{post.author.name}</div>
            <div className="text-sm leading-5 text-live-grey">{post.author.role}</div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function LiveEvents({ events, total }) {
  return (
    <Section spacing="compact">
      <SectionHeader title="Live Events" count={total} noun="Events" />
      {events.length === 1 ? (
        <Reveal>
          <EventCard event={events[0]} layout="wide" sizes="(max-width: 767px) 90vw, 680px" />
        </Reveal>
      ) : (
        <CardGrid>
          {events.map((event, i) => (
            <GridItem key={event.url} index={i}>
              <EventCard event={event} />
            </GridItem>
          ))}
        </CardGrid>
      )}
    </Section>
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
    <>
      <Section spacing="compact">
        <Reveal className="mb-12 flex max-w-[768px] flex-col gap-4 max-[767px]:mb-8">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources' }]} />
          <h1 className={H_PAGE}>Helpful Resources</h1>
        </Reveal>
        <FeaturedPost post={POSTS[0]} />
      </Section>

      <LiveEvents events={events} total={LIVE_EVENTS.length} />

      <Section spacing="compact">
        <SectionHeader
          title="Articles"
          intro="Written recaps of our CMO conversations, with the frameworks and examples shared."
        />
        <CardGrid>
          {articles.map((post, i) => (
            <GridItem key={post.slug} index={i}>
              <ArticleCard post={post} />
            </GridItem>
          ))}
        </CardGrid>
        {articleCount < POSTS.length && <LoadMoreButton onClick={() => setArticleCount((n) => n + PAGE_SIZE)} />}
      </Section>

      <Section spacing="compact">
        <SectionHeader
          title="On Demand Videos"
          intro="Watch the full sessions with the CMOs and marketing leaders behind them."
          count={VIDEOS.length}
          noun="Demand Videos"
        />
        <CardGrid>
          {videos.map((video, i) => (
            <GridItem key={video.slug} index={i}>
              <VideoCard video={video} />
            </GridItem>
          ))}
        </CardGrid>
        {videoCount < VIDEOS.length && <LoadMoreButton onClick={() => setVideoCount((n) => n + PAGE_SIZE)} />}
      </Section>
    </>
  )
}
