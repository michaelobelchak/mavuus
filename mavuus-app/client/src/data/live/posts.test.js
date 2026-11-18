import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIVE_EVENTS, POSTS, srcSetFor } from './posts'
import { VIDEOS } from './videos'

const PUBLIC = path.resolve(import.meta.dirname, '../../../public')

describe('srcSetFor', () => {
  it('should build a srcset of local size variants for a post thumbnail', () => {
    const post = POSTS.find((p) => p.thumbnail === '/images/posts/marketing-ideas-that-delivered-real-results.webp')
    expect(srcSetFor(post.thumbnail)).toBe(
      '/images/posts/marketing-ideas-that-delivered-real-results-p-500.webp 500w, /images/posts/marketing-ideas-that-delivered-real-results-p-800.webp 800w, /images/posts/marketing-ideas-that-delivered-real-results-p-1080.webp 1080w, /images/posts/marketing-ideas-that-delivered-real-results.webp 1408w',
    )
  })

  it('should return undefined for an image with no size variants', () => {
    expect(srcSetFor('/images/avatars/avatar-01.webp')).toBeUndefined()
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

describe('local image paths in src/data/live', () => {
  it('should all point at files that exist in public/', () => {
    const dir = import.meta.dirname
    const sources = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))
    const paths = sources.flatMap((f) => fs.readFileSync(path.join(dir, f), 'utf8').match(/\/images\/[\w/.-]+\.(?:webp|svg)/g) || [])
    expect(paths.length).toBeGreaterThan(100)
    expect([...new Set(paths)].filter((file) => !fs.existsSync(path.join(PUBLIC, file)))).toEqual([])
  })
})
