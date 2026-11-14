import { Video } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Icon, Link, Text } from '../../primitives'
import { videoEmbedSrc } from './videoEmbedSrc'

/**
 * A 16:9 video player with the card radius.
 * - `src`: a YouTube (played from youtube-nocookie.com) or Vimeo URL in a locked down iframe, or a
 *   direct video file (.mp4, .webm...) in a native <video> with controls. Any other URL shows a
 *   "Watch the video" link instead of a broken player. Without `src`, or with a URL that isn't
 *   http(s), it shows a "Video coming soon" placeholder (`emptyLabel`).
 * - `title` names the iframe or video for screen readers (default "Video").
 * `className` and other props go to the frame.
 */
export function VideoEmbed({ src, title = 'Video', emptyLabel = 'Video coming soon', className, ref, ...props }) {
  const frame = 'relative aspect-video overflow-hidden rounded-card'
  const video = src ? videoEmbedSrc(src) : { kind: 'none' }
  if (video.kind === 'none') {
    return (
      <div
        ref={ref}
        className={cn(frame, 'flex flex-col items-center justify-center gap-ds-xs bg-surface-sunken text-text-muted', className)}
        {...props}
      >
        <Icon icon={Video} size="lg" />
        <Text as="span" size="body-sm" tone="muted" className="font-semibold">
          {emptyLabel}
        </Text>
      </div>
    )
  }
  if (video.kind === 'link') {
    // Not something the page can play: link to it instead of showing a broken player.
    return (
      <div
        ref={ref}
        className={cn(frame, 'flex flex-col items-center justify-center gap-ds-sm bg-surface-sunken text-text-muted', className)}
        {...props}
      >
        <Icon icon={Video} size="lg" />
        <Link href={video.src} variant="standalone">
          Watch the video
        </Link>
      </div>
    )
  }
  return (
    <div ref={ref} className={cn(frame, 'bg-surface-inverse', className)} {...props}>
      {video.kind === 'embed' ? (
        <iframe
          src={video.src}
          title={title}
          className="size-full"
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <video controls aria-label={title} className="size-full">
          <source src={video.src} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}
