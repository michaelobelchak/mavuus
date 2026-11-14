const YOUTUBE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
const VIMEO = /vimeo\.com\/(\d+)/

/**
 * Where a video URL plays: a YouTube or Vimeo embed URL, or null for a direct file (.mp4, .webm).
 * Exported for tests.
 */
export function videoEmbedSrc(url) {
  const youtube = url.match(YOUTUBE)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`
  const vimeo = url.match(VIMEO)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}
