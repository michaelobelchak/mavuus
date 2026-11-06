import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { VendorCard, VendorCardSkeleton } from './VendorCard'

const vendor = {
  name: 'Northwind Growth',
  description: 'ABM and paid media agency for B2B SaaS teams between Series A and C.',
  rating: 4.8,
  reviewCount: 32,
  categories: ['ABM', 'Paid Media', 'HubSpot', 'Analytics', 'Content'],
  location: 'Austin, TX',
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <VendorCard {...vendor} to="/dashboard/vendors/5" {...props} />
    </MemoryRouter>,
  )
}

describe('VendorCard', () => {
  it('should link the card through the vendor name', () => {
    renderCard()
    expect(screen.getByRole('link', { name: 'Northwind Growth' })).toHaveAttribute('href', '/dashboard/vendors/5')
  })

  it('should read the rating and review count in words', () => {
    const { container } = renderCard()
    expect(container.querySelector('[data-rating]')).toHaveTextContent('4.8 out of 5 (32 reviews)')
  })

  it('should show up to three categories and a count of the rest', () => {
    renderCard()
    expect(screen.getByText('ABM')).toBeInTheDocument()
    expect(screen.getByText('HubSpot')).toBeInTheDocument()
    expect(screen.queryByText('Analytics')).toBeNull()
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('should say there are no reviews yet when there is no rating', () => {
    renderCard({ rating: null, reviewCount: 0 })
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('should show initials for the logo and the location', () => {
    renderCard()
    expect(screen.getByText('NG')).toBeInTheDocument()
    expect(screen.getByText('Austin, TX')).toBeInTheDocument()
  })

  it('should clamp a long description', () => {
    renderCard()
    expect(screen.getByText(vendor.description)).toHaveClass('line-clamp-3')
  })

  it('should render a busy skeleton', () => {
    render(<VendorCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })
})
