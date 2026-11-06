import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { resetWarnings } from '../../lib/warnOnce'
import { Card, CardAction, CardLink } from './Card'

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

  it('should always be positioned so a CardLink overlay covers it', () => {
    render(<Card data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('relative')
  })

  it('should name the CardLink with the title only and stretch it over the card', () => {
    render(
      <MemoryRouter>
        <Card interactive>
          <h3>
            <CardLink to="/jobs/42">Head of Growth</CardLink>
          </h3>
          <p>Remote, full time</p>
        </Card>
      </MemoryRouter>,
    )
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('Head of Growth')
    expect(links[0]).toHaveAttribute('href', '/jobs/42')
    expect(links[0]).toHaveClass('after:absolute', 'after:inset-0')
  })

  it('should show the focus ring on the whole card when its CardLink has keyboard focus', () => {
    render(<Card data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass(
      'has-[[data-card-link]:focus-visible]:outline-2',
      'has-[[data-card-link]:focus-visible]:outline-border-focus',
    )
  })

  it('should keep a CardAction button clickable above the link and outside it', () => {
    const onSave = vi.fn()
    render(
      <MemoryRouter>
        <Card>
          <h3>
            <CardLink to="/jobs/42">Head of Growth</CardLink>
          </h3>
          <CardAction>
            <button type="button" onClick={onSave}>
              Save
            </button>
          </CardAction>
        </Card>
      </MemoryRouter>,
    )
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save.closest('a')).toBeNull()
    expect(save.parentElement).toHaveClass('relative', 'z-(--ds-z-raised)')
    fireEvent.click(save)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('should open an external CardLink in a new tab with the screen reader hint', () => {
    render(
      <Card>
        <CardLink href="https://mavuus.com/events">Events</CardLink>
      </Card>,
    )
    expect(screen.getByRole('link', { name: 'Events (opens in a new tab)' })).toHaveAttribute('target', '_blank')
  })

  it('should not take to or href on Card itself', () => {
    render(
      <MemoryRouter>
        <Card to="/jobs/42" data-testid="card">
          Head of Growth
        </Card>
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByTestId('card')).not.toHaveAttribute('to')
  })

  it('should strip target and rel from Card and warn when given link props', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Card target="_blank" rel="noopener" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card).not.toHaveAttribute('target')
    expect(card).not.toHaveAttribute('rel')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Card: .*not supported/))
  })

  it('should warn in dev when a CardLink sits inside another link', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <a href="/outer">
        <Card>
          <CardLink href="/inner">Inner</CardLink>
        </Card>
      </a>,
    )
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/CardLink: .*inside another link/))
  })
})
