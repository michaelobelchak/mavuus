import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import LiveButton from '../../components/live/LiveButton'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import Card from '../../components/live/ui/Card'
import { H_CARD, H_PAGE } from '../../components/live/ui/Typography'
import {
  Breadcrumb,
  CardGrid,
  GridItem,
  PlayBadge,
  SectionHeader,
  SignUpOverlay,
  VideoCard,
} from '../../components/live/resources/cards'
import { srcSetFor } from '../../data/live/posts'
import { VIDEOS, getVideo } from '../../data/live/videos'

function truncate(text, max = 50) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

function moreVideos(video, count = 3) {
  const start = VIDEOS.indexOf(video)
  return Array.from({ length: count }, (_, i) => VIDEOS[(start + 1 + i) % VIDEOS.length])
}

export default function VideoPage() {
  const { slug } = useParams()
  const video = getVideo(slug)

  useEffect(() => {
    document.title = video ? `${video.title} - Mavuus` : 'Video not found - Mavuus'
  }, [video])

  if (!video) {
    return (
      <Section>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className={H_PAGE}>Video not found</h1>
          <p className="m-0">The video you are looking for does not exist or has moved.</p>
          <Link to="/resources" className="inline-flex min-h-11 items-center font-semibold text-brand-blue underline hover:text-brand-pink">
            Back to Resources
          </Link>
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section spacing="compact">
        <div className="max-w-[868px]">
          <Reveal className="mb-10 flex flex-col items-start gap-4 max-[767px]:mb-8">
            <Breadcrumb items={[{ label: 'Resources', to: '/resources' }, { label: truncate(video.title) }]} />
            <h1 className={H_PAGE}>{video.title}</h1>
          </Reveal>

          <Reveal variant="clip">
            <Link
              to="/register"
              aria-label={`Sign up to watch ${video.title}`}
              className="group relative block overflow-hidden rounded-3xl max-[767px]:rounded-2xl"
            >
              <img
                src={video.thumbnail}
                srcSet={srcSetFor(video.thumbnail)}
                sizes="(max-width: 991px) 92vw, 868px"
                alt=""
                className="aspect-video w-full bg-live-blue-light object-cover transition-transform duration-500 ease-[var(--ease-live)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-dark-blue/20" />
              <PlayBadge large />
              <SignUpOverlay />
            </Link>
          </Reveal>

          <Reveal>
            <Card
              variant="surface"
              className="mt-8 flex items-center justify-between gap-8 p-8 max-[767px]:flex-col max-[767px]:items-start max-[767px]:gap-6 max-[767px]:p-6"
            >
              <h2 className={H_CARD}>Sign Up for Mavuus to get access to all videos</h2>
              <div className="flex shrink-0 items-center gap-4 max-[767px]:w-full max-[767px]:flex-col">
                <LiveButton to="/register" variant="blue" className="whitespace-nowrap">
                  Sign Up
                </LiveButton>
                <LiveButton to="/login" variant="outline" className="whitespace-nowrap">
                  Log in
                </LiveButton>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section spacing="compact">
        <SectionHeader title="More Mavuus Insights" />
        <CardGrid>
          {moreVideos(video).map((item, i) => (
            <GridItem key={item.slug} index={i}>
              <VideoCard video={item} />
            </GridItem>
          ))}
        </CardGrid>
      </Section>
    </>
  )
}
