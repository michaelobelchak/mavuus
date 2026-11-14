import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoEmbed } from './VideoEmbed'
import { videoEmbedSrc } from './videoEmbedSrc'

describe('VideoEmbed', () => {
  it('should show the coming soon placeholder when there is no src', () => {
    render(<VideoEmbed />)
    expect(screen.getByText('Video coming soon')).toBeInTheDocument()
  })

  it('should embed YouTube without cookies in a named, locked down iframe', () => {
    render(<VideoEmbed src="https://www.youtube.com/watch?v=abc123" title="Brand talk" />)
    const frame = screen.getByTitle('Brand talk')
    expect(frame).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/abc123')
    expect(frame).toHaveAttribute('allow', 'accelerometer; encrypted-media; picture-in-picture; fullscreen')
    expect(frame).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
  })

  it('should embed Vimeo page URLs', () => {
    render(<VideoEmbed src="https://vimeo.com/42" title="Talk" />)
    expect(screen.getByTitle('Talk')).toHaveAttribute('src', 'https://player.vimeo.com/video/42')
  })

  it('should play a direct file in a native video with controls', () => {
    const { container } = render(<VideoEmbed src="/videos/talk.mp4" title="Talk" />)
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('aria-label', 'Talk')
    expect(container.querySelector('source')).toHaveAttribute('src', '/videos/talk.mp4')
  })

  it('should show the placeholder, with no link or player, for a URL that is not http or https', () => {
    const { container } = render(<VideoEmbed src="javascript:alert(1)" title="Talk" />)
    expect(screen.getByText('Video coming soon')).toBeInTheDocument()
    expect(container.querySelector('a, video, iframe')).toBeNull()
  })

  it('should link out instead of a broken player when the URL is not a video', () => {
    const { container } = render(<VideoEmbed src="https://example.com/watch-page" title="Talk" />)
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('link', { name: /Watch the video/ })).toHaveAttribute('href', 'https://example.com/watch-page')
  })
})

describe('videoEmbedSrc', () => {
  it('should read YouTube ids from every common URL shape', () => {
    const embed = 'https://www.youtube-nocookie.com/embed/xyz'
    expect(videoEmbedSrc('https://youtu.be/xyz')).toEqual({ kind: 'embed', src: embed })
    expect(videoEmbedSrc('https://www.youtube.com/watch?feature=share&v=xyz&t=10')).toEqual({ kind: 'embed', src: embed })
    expect(videoEmbedSrc('https://www.youtube.com/shorts/xyz')).toEqual({ kind: 'embed', src: embed })
    expect(videoEmbedSrc('https://www.youtube.com/embed/xyz')).toEqual({ kind: 'embed', src: embed })
  })

  it('should tell files from other pages', () => {
    expect(videoEmbedSrc('/a.webm')).toEqual({ kind: 'file', src: '/a.webm' })
    expect(videoEmbedSrc('https://cdn.example.com/talk.MP4?sig=1')).toEqual({ kind: 'file', src: 'https://cdn.example.com/talk.MP4?sig=1' })
    expect(videoEmbedSrc('https://example.com/page')).toEqual({ kind: 'link', src: 'https://example.com/page' })
    expect(videoEmbedSrc('javascript:alert(1).mp4')).toEqual({ kind: 'none', src: 'javascript:alert(1).mp4' })
    expect(videoEmbedSrc('data:video/mp4;base64,AAAA')).toEqual({ kind: 'none', src: 'data:video/mp4;base64,AAAA' })
  })
})
