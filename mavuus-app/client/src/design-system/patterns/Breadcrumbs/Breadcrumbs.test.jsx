import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'

const items = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Jobs', to: '/dashboard/jobs' },
  { label: 'Head of Growth at a Series B fintech in New York', to: '/dashboard/jobs/42' },
]

function renderCrumbs(props) {
  return render(
    <MemoryRouter>
      <Breadcrumbs items={items} {...props} />
    </MemoryRouter>,
  )
}

describe('Breadcrumbs', () => {
  it('should render a named nav with an ordered list of items', () => {
    renderCrumbs()
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByRole('list').tagName).toBe('OL')
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
  })

  it('should link every item but the last, which is the current page', () => {
    renderCrumbs()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute('href', '/dashboard/jobs')
    const current = screen.getByText(items[2].label)
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.closest('a')).toBeNull()
  })

  it('should hide the separators from screen readers', () => {
    const { container } = renderCrumbs()
    const separators = container.querySelectorAll('[data-breadcrumb-separator]')
    expect(separators).toHaveLength(2)
    for (const separator of separators) expect(separator).toHaveAttribute('aria-hidden', 'true')
  })

  it('should truncate long labels and keep the full label as a title', () => {
    renderCrumbs()
    const current = screen.getByText(items[2].label)
    expect(current).toHaveClass('truncate')
    expect(current).toHaveAttribute('title', items[2].label)
  })

  it('should take a custom nav label', () => {
    renderCrumbs({ 'aria-label': 'You are here' })
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument()
  })
})
