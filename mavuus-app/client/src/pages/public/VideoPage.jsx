import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import LiveContainer from '../../components/live/LiveContainer'
import LiveButton from '../../components/live/LiveButton'
import { Breadcrumb, LIST_CLASSES, SectionHeader, VideoCard } from '../../components/live/resources/cards'
import { PlayIcon } from '../../components/live/resources/icons'
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
      <LiveContainer innerClassName="py-24">
        <div className="py-16 text-center">
          <h1 className="mb-4 text-dark-blue">Video not found</h1>
          <p className="mb-8">The video you are looking for does not exist or has moved.</p>
          <Link to="/resources" className="font-semibold text-brand-blue underline">
            Back to Resources
          </Link>
        </div>
      </LiveContainer>
    )
  }

  return (
    <LiveContainer innerClassName="py-24">
      <div className="pt-16 max-md:pt-8">
        <div className="max-w-[868px]">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Resources', to: '/resources' }, { label: truncate(video.title) }]} />
          </div>
          <h1 className="mb-12 text-[28px] leading-[1.2] font-normal text-balance text-dark-blue max-lg:text-[clamp(25px,5vw,48px)] max-md:mb-8 max-md:text-[32px]">
            {video.title}
          </h1>

          <Link
            to="/register"
            aria-label={`Sign up to watch ${video.title}`}
            className="group relative flex items-center justify-center overflow-hidden rounded-2xl"
          >
            <img src={video.thumbnail} alt={video.title} className="aspect-video w-full rounded-2xl object-cover" />
            <span className="absolute inset-0 bg-dark-blue/20" aria-hidden="true" />
            <span className="absolute flex size-20 items-center justify-center rounded-full border border-white bg-white/20 text-white backdrop-blur-[15px] transition-transform duration-300 group-hover:scale-110 max-md:size-14">
              <PlayIcon className="relative left-0.5 size-8 max-md:size-6" />
            </span>
          </Link>

          <div className="mt-8 flex items-center justify-between gap-8 rounded-2xl border border-[#dbe0e7] bg-white p-8 max-md:flex-col max-md:items-start max-md:gap-6 max-md:p-6">
            <h2 className="text-[22px] leading-[26.4px] font-medium text-dark-blue">
              Sign Up for Mavuus to get access to all videos
            </h2>
            <div className="flex shrink-0 items-center gap-4 max-md:w-full max-md:flex-col">
              <LiveButton to="/register">Sign Up</LiveButton>
              <LiveButton to="/login" variant="secondary">
                Log in
              </LiveButton>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-8">
          <SectionHeader title="More Mavuus Insights" />
          <div className={`${LIST_CLASSES} border-b-0`}>
            {moreVideos(video).map((item) => (
              <VideoCard key={item.slug} video={item} />
            ))}
          </div>
        </div>
      </div>
    </LiveContainer>
  )
}
