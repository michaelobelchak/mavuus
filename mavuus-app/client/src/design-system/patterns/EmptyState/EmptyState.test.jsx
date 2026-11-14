import { describe, it, expect, vi, afterEach } from 'vitest'
import { resetWarnings } from '../../lib/warnOnce'
import { render, screen } from '@testing-library/react'
import { Inbox } from 'lucide-react'
import { Button } from '../../primitives'
import { EmptyState } from './EmptyState'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('EmptyState', () => {
  it('should render the title as an h3 with the description and a decorative icon', () => {
    const { container } = render(
      <EmptyState icon={Inbox} title="No messages yet" description="When members write to you, it shows up here." />,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'No messages yet' })).toBeInTheDocument()
    expect(screen.getByText('When members write to you, it shows up here.')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should render the actions', () => {
    render(<EmptyState title="No jobs" actions={<Button>Post a job</Button>} />)
    expect(screen.getByRole('button', { name: 'Post a job' })).toBeInTheDocument()
  })

  it('should use the heading level given', () => {
    render(<EmptyState title="No jobs" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2, name: 'No jobs' })).toBeInTheDocument()
  })

  it('should use tighter padding and a smaller title when size is sm', () => {
    const { container, rerender } = render(<EmptyState title="No jobs" />)
    expect(container.firstElementChild).toHaveClass('p-ds-xxl')
    expect(screen.getByRole('heading')).toHaveClass('text-h3')
    rerender(<EmptyState title="No jobs" size="sm" />)
    expect(container.firstElementChild).toHaveClass('p-ds-lg')
    expect(screen.getByRole('heading')).toHaveClass('text-h4')
  })

  it('should warn and use h3 when headingLevel is unsupported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<EmptyState title="No jobs" headingLevel={5} />)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/EmptyState: headingLevel "5"/))
  })
})
