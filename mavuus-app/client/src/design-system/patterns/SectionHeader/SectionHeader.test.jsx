import { describe, it, expect, vi, afterEach } from 'vitest'
import { resetWarnings } from '../../lib/warnOnce'
import { render, screen } from '@testing-library/react'
import { Button } from '../../primitives'
import { SectionHeader } from './SectionHeader'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('SectionHeader', () => {
  it('should render the title as an h2 at h2 size by default', () => {
    render(<SectionHeader title="Upcoming sessions" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Upcoming sessions' })).toHaveClass('text-h2')
  })

  it('should use the heading level and its size when given headingLevel', () => {
    render(<SectionHeader title="This week" headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'This week' })).toHaveClass('text-h3')
  })

  it('should render the eyebrow, description and actions when given', () => {
    render(
      <SectionHeader
        title="Upcoming sessions"
        eyebrow="Live"
        description="Join a session or watch the recording later."
        actions={<Button variant="outline">See all</Button>}
      />,
    )
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Join a session or watch the recording later.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument()
  })

  it('should warn and use h2 when headingLevel is unsupported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SectionHeader title="This week" headingLevel={6} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/SectionHeader: headingLevel "6"/))
  })
})
