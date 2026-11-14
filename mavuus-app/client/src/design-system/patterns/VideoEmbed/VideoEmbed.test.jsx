import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoEmbed } from './VideoEmbed'
import { videoEmbedSrc } from './videoEmbedSrc'

describe('VideoEmbed', () => {
  it('should show the coming soon placeholder when there is no src', () => {
    render(<VideoEmbed />)
    expect(screen.getByText('Video coming soon')).toBeInTheDocument()
  })

  it('should embed YouTube and Vimeo page URLs in a named iframe', () => {
    const { container, rerender } = render(<VideoEmbed src="https://www.youtube.com/watch?v=abc123" title="Brand talk" />)
    expect(screen.getByTitle('Brand talk')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123')
    rerender(<VideoEmbed src="https://vimeo.com/42" title="Brand talk" />)
    expect(container.querySelector('iframe')).toHaveAttribute('src', 'https://player.vimeo.com/video/42')
  })

  it('should play a direct file in a native video with controls', () => {
    const { container } = render(<VideoEmbed src="/videos/talk.mp4" title="Talk" />)
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('aria-label', 'Talk')
    expect(container.querySelector('source')).toHaveAttribute('src', '/videos/talk.mp4')
  })

  it('should return null from videoEmbedSrc when the URL is a file', () => {
    expect(videoEmbedSrc('https://youtu.be/xyz')).toBe('https://www.youtube.com/embed/xyz')
    expect(videoEmbedSrc('/a.webm')).toBeNull()
  })
})
