import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../../primitives'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('should render the title as an h2 at h2 size by default', () => {
    render(<SectionHeader title="Upcoming sessions" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Upcoming sessions' })).toHaveClass('text-h2')
  })

  it('should use the heading level and its size when given level', () => {
    render(<SectionHeader title="This week" level={3} />)
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
})
