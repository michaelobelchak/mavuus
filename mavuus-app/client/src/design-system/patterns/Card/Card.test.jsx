import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { resetWarnings } from '../../lib/warnOnce'
import { Card } from './Card'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Card', () => {
  it('should render a white feature card with a hairline border and card shadow by default', () => {
    render(<Card data-testid="card">Members</Card>)
    const card = screen.getByTestId('card')
    expect(card.tagName).toBe('DIV')
    expect(card).toHaveClass('rounded-card', 'bg-surface-raised', 'border-border-subtle', 'shadow-card', 'p-ds-lg')
  })

  it('should use the variant surface, radius and shadow when given a variant', () => {
    const { rerender } = render(<Card data-testid="card" variant="surface" />)
    expect(screen.getByTestId('card')).toHaveClass('border-border-default', 'bg-surface-raised')
    expect(screen.getByTestId('card')).not.toHaveClass('shadow-card')
    rerender(<Card data-testid="card" variant="panel" />)
    expect(screen.getByTestId('card')).toHaveClass('rounded-panel', 'bg-surface-sunken')
    rerender(<Card data-testid="card" variant="panel-pink" />)
    expect(screen.getByTestId('card')).toHaveClass('rounded-panel', 'bg-surface-selected')
  })

  it('should drop root padding and render the media on top when variant is media', () => {
    render(
      <Card data-testid="card" variant="media" media={<img alt="Panel recap" src="/recap.jpg" />}>
        <p>Recap</p>
      </Card>,
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('p-ds-none', 'overflow-hidden')
    expect(card.firstElementChild).toContainElement(screen.getByRole('img', { name: 'Panel recap' }))
    expect(screen.getByText('Recap').parentElement).toHaveClass('p-ds-lg')
  })

  it('should add the 4px pink left rule when rule is set', () => {
    render(<Card data-testid="card" rule />)
    expect(screen.getByTestId('card')).toHaveClass('border-l-4', 'border-l-border-brand')
  })

  it('should lift on hover with a reduced motion fallback when interactive', () => {
    render(<Card data-testid="card" interactive />)
    expect(screen.getByTestId('card')).toHaveClass(
      'hover:-translate-y-1',
      'hover:shadow-card-hover',
      'motion-reduce:hover:translate-y-0',
      'motion-reduce:transition-none',
    )
  })

  it('should use the padding step when given padding', () => {
    render(<Card data-testid="card" padding="sm" />)
    expect(screen.getByTestId('card')).toHaveClass('p-ds-sm')
    expect(screen.getByTestId('card')).not.toHaveClass('p-ds-lg')
  })

  it('should render the tag given by as', () => {
    render(
      <ul>
        <Card as="li" data-testid="card" />
      </ul>,
    )
    expect(screen.getByTestId('card').tagName).toBe('LI')
  })

  it('should warn and fall back to feature when the variant is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Card data-testid="card" variant="glass" />)
    expect(screen.getByTestId('card')).toHaveClass('shadow-card')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Card: variant "glass"/))
  })

  it('should make the whole card one router link named by its content when given to', () => {
    render(
      <MemoryRouter>
        <Card to="/jobs/42">
          <h3>Head of Growth</h3>
          <p>Remote</p>
        </Card>
      </MemoryRouter>,
    )
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/jobs/42')
    expect(links[0]).toHaveAccessibleName('Head of Growth Remote')
    expect(links[0]).toHaveClass('rounded-card', 'hover:-translate-y-1')
  })

  it('should keep the as tag around the link when given as and to', () => {
    render(
      <MemoryRouter>
        <ul>
          <Card as="li" to="/jobs/42" data-testid="card">
            Head of Growth
          </Card>
        </ul>
      </MemoryRouter>,
    )
    const item = screen.getByRole('listitem')
    expect(item).toContainElement(screen.getByRole('link', { name: 'Head of Growth' }))
    expect(screen.getByTestId('card')).toBe(screen.getByRole('link'))
  })

  it('should open an external href in a new tab with the screen reader hint', () => {
    render(<Card href="https://mavuus.com/events">Events</Card>)
    const link = screen.getByRole('link', { name: 'Events (opens in a new tab)' })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should warn in dev when a link card contains another interactive element', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Card href="/jobs/42">
        Head of Growth <button type="button">Save</button>
      </Card>,
    )
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Card: .*interactive/))
  })

  it('should not warn when a link card has no nested interactive elements', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Card href="/jobs/42">Head of Growth</Card>)
    expect(error).not.toHaveBeenCalled()
  })
})
