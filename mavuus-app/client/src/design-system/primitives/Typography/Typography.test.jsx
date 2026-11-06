import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Caption, Eyebrow, Heading, Text } from './Typography'

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

describe('Eyebrow', () => {
  it('should be a pink uppercase label by default', () => {
    render(<Eyebrow>For marketing leaders</Eyebrow>)
    const eyebrow = screen.getByText('For marketing leaders')
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('uppercase', 'font-semibold', 'text-body-sm', 'text-text-brand')
  })

  it('should use the darker brand text when tone is brand-strong', () => {
    render(<Eyebrow tone="brand-strong">Events</Eyebrow>)
    expect(screen.getByText('Events')).toHaveClass('text-text-brand-strong')
  })
})

describe('Caption', () => {
  it('should render muted caption text in a span', () => {
    render(<Caption>Posted 2 days ago</Caption>)
    const caption = screen.getByText('Posted 2 days ago')
    expect(caption.tagName).toBe('SPAN')
    expect(caption).toHaveClass('text-caption', 'text-text-muted')
  })

  it('should render the element given in as', () => {
    render(<Caption as="figcaption">Photo by the team</Caption>)
    expect(screen.getByText('Photo by the team').tagName).toBe('FIGCAPTION')
  })
})
