import { isHttpUrl } from '../../lib/safeUrl'

const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i

function youtubeId(url) {
  if (/^(www\.|m\.)?youtu\.be$/.test(url.hostname)) return url.pathname.split('/')[1] || null
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) return null
  if (url.pathname === '/watch') return url.searchParams.get('v')
  const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)
  return match ? match[1] : null
}

/**
 * How a video URL plays: `{ kind: 'embed', src }` for YouTube (privacy-enhanced
 * youtube-nocookie.com; watch?v=, youtu.be, /embed/ and /shorts/ URLs) and Vimeo,
 * `{ kind: 'file', src }` for a direct video file, `{ kind: 'link', src }` for any other http(s)
 * page, or `{ kind: 'none', src }` for anything that isn't http(s) (javascript:, data:...).
 */
export function videoEmbedSrc(src) {
  if (!isHttpUrl(src)) return { kind: 'none', src }
  let url
  try {
    url = new URL(src, 'http://local.invalid')
  } catch {
    return { kind: 'link', src }
  }
  const id = youtubeId(url)
  if (id) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` }
  const vimeo = /(^|\.)vimeo\.com$/.test(url.hostname) && url.pathname.match(/^\/(?:video\/)?(\d+)/)
  if (vimeo) return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}` }
  if (VIDEO_FILE.test(url.pathname)) return { kind: 'file', src }
  return { kind: 'link', src }
}
