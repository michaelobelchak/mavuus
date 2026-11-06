import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Users } from 'lucide-react'
import { mockReducedMotion } from '../../test/browserMocks'
import { StatCard } from './StatCard'

afterEach(() => vi.unstubAllGlobals())

const stat = { icon: Users, label: 'Users', value: 430, trend: { value: 32.54 }, period: 'Last 30 days' }

describe('StatCard', () => {
  it('should give screen readers one readable summary and hide the visual parts', () => {
    mockReducedMotion(true)
    const { container } = render(<StatCard {...stat} data-testid="stat" />)
    expect(screen.getByText('Users 430, up 32.54 percent, last 30 days')).toHaveClass('sr-only')
    const visual = container.querySelector('[aria-hidden="true"]')
    expect(visual).toHaveTextContent('Users')
    expect(visual).toHaveTextContent('430')
    expect(visual).toHaveTextContent('Last 30 days')
  })

  it('should name the link with the summary when given to', () => {
    mockReducedMotion(true)
    render(
      <MemoryRouter>
        <StatCard {...stat} to="/admin/users" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveAccessibleName('Users 430, up 32.54 percent, last 30 days')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/admin/users')
  })

  it('should summarize without trend and period when they are missing', () => {
    mockReducedMotion(true)
    render(<StatCard label="Open jobs" value="12" />)
    expect(screen.getByText('Open jobs 12')).toHaveClass('sr-only')
  })

  it('should speak a down trend that is good as down', () => {
    mockReducedMotion(true)
    render(<StatCard label="Churn" value="2.1%" trend={{ value: -0.4, goodWhen: 'down' }} />)
    expect(screen.getByText('Churn 2.1%, down 0.40 percent')).toBeInTheDocument()
  })

  it('should show the icon in a tinted control-radius tile', () => {
    mockReducedMotion(true)
    const { container } = render(<StatCard {...stat} />)
    const tile = container.querySelector('svg').parentElement
    expect(tile).toHaveClass('size-10', 'rounded-control', 'bg-surface-selected', 'text-text-brand-strong')
  })

  it('should show the value large and semibold', () => {
    mockReducedMotion(true)
    render(<StatCard {...stat} />)
    const value = screen.getAllByText('430').find((el) => el.closest('[data-stat-value]'))
    expect(value.closest('[data-stat-value]')).toHaveClass('text-h2', 'font-semibold')
  })

  it('should show a skeleton and set aria-busy when loading', () => {
    const { container } = render(<StatCard {...stat} loading data-testid="stat" />)
    const card = screen.getByTestId('stat')
    expect(card).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    expect(screen.queryByText('430')).toBeNull()
    expect(screen.getByText('Loading Users')).toHaveClass('sr-only')
  })

  it('should render no link while loading even when given to', () => {
    render(
      <MemoryRouter>
        <StatCard {...stat} to="/admin/users" loading />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link')).toBeNull()
  })
})
