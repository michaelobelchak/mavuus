import { Video, Play } from 'lucide-react'

function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  return match ? match[1] : null
}

function getVimeoId(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl) {
    return (
      <div className="aspect-video rounded-xl bg-neutral-100 flex flex-col items-center justify-center text-neutral-400">
        <Video size={48} className="mb-2 opacity-40" />
        <p className="text-sm font-medium">Video coming soon</p>
      </div>
    )
  }

  const youtubeId = getYouTubeId(videoUrl)
  if (youtubeId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full"
          allowFullScreen
          title="Video"
        />
      </div>
    )
  }

  const vimeoId = getVimeoId(videoUrl)
  if (vimeoId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="w-full h-full"
          allowFullScreen
          title="Video"
        />
      </div>
    )
  }

  // HTML5 video (.mp4, .webm, etc.)
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video controls className="w-full h-full">
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
