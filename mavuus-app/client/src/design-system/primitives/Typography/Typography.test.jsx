import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warnOnce'
import { Caption, Eyebrow, Heading, Text } from './Typography'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Heading', () => {
  it.each([1, 2, 3, 4])('should render an h%i when level is %i', (level) => {
    render(<Heading level={level}>Find your next role</Heading>)
    expect(screen.getByRole('heading', { level, name: 'Find your next role' })).toBeInTheDocument()
  })

  it('should take its size from the level when size is not given', () => {
    render(<Heading level={3}>Upcoming events</Heading>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-h3')
  })

  it('should keep the level tag when size is set separately', () => {
    render(
      <Heading level={1} size="h3">
        Dashboard
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-h3')
    expect(heading).not.toHaveClass('text-h1')
  })

  it('should allow the display size and a tone', () => {
    render(
      <Heading level={1} size="display" tone="on-brand">
        Lead with community
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display', 'text-text-on-brand')
  })

  it.each([5, 6])('should warn and render an h4 when level is %i', (level) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Heading level={level}>Deep heading</Heading>)
    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toHaveClass('text-h4')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Heading.*level.*5|Heading.*level.*6/))
  })

  it('should warn and use the level size when size is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Heading level={3} size="huge">
        Upcoming events
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-h3')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Heading.*size.*"huge"/))
  })

  it('should share the brand tone meaning with Text', () => {
    render(<Heading tone="brand">Brand heading</Heading>)
    expect(screen.getByRole('heading')).toHaveClass('text-text-brand-strong')
  })

  it('should default to primary text and an h2 when level is missing', () => {
    render(<Heading>Section</Heading>)
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-h2', 'text-text-primary')
  })
})

describe('Text', () => {
  it('should render a paragraph with body size and primary tone by default', () => {
    render(<Text>Members share what works.</Text>)
    const text = screen.getByText('Members share what works.')
    expect(text.tagName).toBe('P')
    expect(text).toHaveClass('text-body', 'text-text-primary')
  })

  it('should render the element given in as', () => {
    render(
      <Text as="span" size="body-sm" tone="secondary">
        3 new
      </Text>,
    )
    const text = screen.getByText('3 new')
    expect(text.tagName).toBe('SPAN')
    expect(text).toHaveClass('text-body-sm', 'text-text-secondary')
  })

  it.each([
    ['lead', 'text-lead'],
    ['caption', 'text-caption'],
  ])('should apply the %s size', (size, cls) => {
    render(<Text size={size}>Copy</Text>)
    expect(screen.getByText('Copy')).toHaveClass(cls)
  })

  it.each([
    ['muted', 'text-text-muted'],
    ['brand', 'text-text-brand-strong'],
    ['link', 'text-text-link'],
    ['success', 'text-status-success'],
    ['error', 'text-status-error'],
  ])('should apply the %s tone', (tone, cls) => {
    render(<Text tone={tone}>Copy</Text>)
    expect(screen.getByText('Copy')).toHaveClass(cls)
  })
})

describe('Text fallbacks', () => {
  it('should warn and fall back to the defaults when tone or size is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Text tone="pink" size="giant">
        Copy
      </Text>,
    )
    expect(screen.getByText('Copy')).toHaveClass('text-body', 'text-text-primary')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Text.*tone.*"pink"/))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Text.*size.*"giant"/))
  })
})

describe('Eyebrow', () => {
  it('should be the light pink accent by default', () => {
    render(<Eyebrow>For marketing leaders</Eyebrow>)
    const eyebrow = screen.getByText('For marketing leaders')
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('uppercase', 'font-semibold', 'text-body-sm', 'text-text-brand')
  })

  it('should use the readable brand text when tone is brand, like Text', () => {
    render(<Eyebrow tone="brand">Events</Eyebrow>)
    expect(screen.getByText('Events')).toHaveClass('text-text-brand-strong')
  })

  it('should accept the shared tones', () => {
    render(<Eyebrow tone="muted">Events</Eyebrow>)
    expect(screen.getByText('Events')).toHaveClass('text-text-muted')
  })

  it('should warn and use accent when the tone is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Eyebrow tone="brand-strong">Events</Eyebrow>)
    expect(screen.getByText('Events')).toHaveClass('text-text-brand')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Eyebrow.*tone.*"brand-strong"/))
  })
})

describe('Caption', () => {
  it('should render muted caption text in a span', () => {
    render(<Caption>Posted 2 days ago</Caption>)
    const caption = screen.getByText('Posted 2 days ago')
    expect(caption.tagName).toBe('SPAN')
    expect(caption).toHaveClass('text-caption', 'text-text-muted')
  })

  it('should take the shared tones and warn on unknown ones', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <Caption tone="error">Required</Caption>
        <Caption tone="accent">Odd</Caption>
      </>,
    )
    expect(screen.getByText('Required')).toHaveClass('text-status-error')
    expect(screen.getByText('Odd')).toHaveClass('text-text-muted')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Caption.*tone.*"accent"/))
  })

  it('should render the element given in as', () => {
    render(<Caption as="figcaption">Photo by the team</Caption>)
    expect(screen.getByText('Photo by the team').tagName).toBe('FIGCAPTION')
  })
})
