import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Link } from './Link'

describe('Link', () => {
  it('should open in a new tab with rel and screen reader text when href is external', () => {
    render(<Link href="https://mavuus.com/events">See events</Link>)
    const link = screen.getByRole('link', { name: 'See events (opens in a new tab)' })
    expect(link).toHaveAttribute('href', 'https://mavuus.com/events')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('(opens in a new tab)')).toHaveClass('sr-only')
  })

  it('should render a plain anchor without a new tab when href is not external', () => {
    render(<Link href="mailto:hello@mavuus.com">Email us</Link>)
    const link = screen.getByRole('link', { name: 'Email us' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('should render a router link when given to', () => {
    render(
      <MemoryRouter>
        <Link to="/members">Members</Link>
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Members' })
    expect(link).toHaveAttribute('href', '/members')
    expect(link).not.toHaveAttribute('target')
  })

  it('should underline only on hover when variant is standalone', () => {
    render(
      <Link href="/about" variant="standalone">
        About
      </Link>,
    )
    const link = screen.getByRole('link', { name: 'About' })
    expect(link).toHaveClass('no-underline', 'hover:underline')
  })

  it('should not add the new tab hint when the consumer sets target to _self', () => {
    render(
      <Link href="https://mavuus.com" target="_self" rel="external">
        Mavuus
      </Link>,
    )
    const link = screen.getByRole('link', { name: 'Mavuus' })
    expect(link).toHaveAttribute('target', '_self')
    expect(link).toHaveAttribute('rel', 'external')
    expect(screen.queryByText('(opens in a new tab)')).not.toBeInTheDocument()
  })

  it('should add the new tab hint and a safe rel when the consumer sets target to _blank', () => {
    render(
      <Link href="/report.pdf" target="_blank">
        Annual report
      </Link>,
    )
    const link = screen.getByRole('link', { name: 'Annual report (opens in a new tab)' })
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
