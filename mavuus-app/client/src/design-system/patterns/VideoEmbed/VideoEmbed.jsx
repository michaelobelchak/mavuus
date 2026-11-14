import { Video } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Icon, Text } from '../../primitives'
import { videoEmbedSrc } from './videoEmbedSrc'

/**
 * A 16:9 video player with the card radius.
 * - `src`: a YouTube or Vimeo page URL (played in an iframe) or a direct video file (a native
 *   <video> with controls). Without `src` it shows a "Video coming soon" placeholder (`emptyLabel`).
 * - `title` names the iframe or video for screen readers (default "Video").
 * `className` and other props go to the frame.
 */
export function VideoEmbed({ src, title = 'Video', emptyLabel = 'Video coming soon', className, ref, ...props }) {
  const frame = 'relative aspect-video overflow-hidden rounded-card'
  if (!src) {
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
  const embed = videoEmbedSrc(src)
  return (
    <div ref={ref} className={cn(frame, 'bg-surface-inverse', className)} {...props}>
      {embed ? (
        <iframe src={embed} title={title} className="size-full" allowFullScreen loading="lazy" />
      ) : (
        <video controls aria-label={title} className="size-full">
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}
