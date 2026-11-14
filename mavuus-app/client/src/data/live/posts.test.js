import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIVE_EVENTS, POSTS, srcSetFor } from './posts'
import { VIDEOS } from './videos'

const PUBLIC = path.resolve(import.meta.dirname, '../../../public')

describe('srcSetFor', () => {
  it('should build a srcset of local size variants for a post thumbnail', () => {
    const post = POSTS.find((p) => p.thumbnail === '/images/posts/marketing-ideas-that-delivered-real-results.png')
    expect(srcSetFor(post.thumbnail)).toBe(
      '/images/posts/marketing-ideas-that-delivered-real-results-p-500.png 500w, /images/posts/marketing-ideas-that-delivered-real-results-p-800.png 800w, /images/posts/marketing-ideas-that-delivered-real-results-p-1080.png 1080w, /images/posts/marketing-ideas-that-delivered-real-results.png 1408w',
    )
  })

  it('should return undefined for an image with no size variants', () => {
    expect(srcSetFor('/images/avatars/avatar-01.jpg')).toBeUndefined()
    expect(srcSetFor(undefined)).toBeUndefined()
  })

  it('should only point at files that exist in public/', () => {
    const images = [...POSTS.map((p) => p.thumbnail), ...VIDEOS.map((v) => v.thumbnail), ...LIVE_EVENTS.map((e) => e.image)]
    const missing = images
      .flatMap((src) => (srcSetFor(src) || src).split(', ').map((part) => part.split(' ')[0]))
      .filter((file) => !fs.existsSync(path.join(PUBLIC, file)))
    expect(missing).toEqual([])
  })
})
