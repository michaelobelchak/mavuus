import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
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

  it('should name the article by the vendor name', () => {
    renderCard()
    expect(screen.getByRole('article', { name: 'Northwind Growth' })).toBeInTheDocument()
  })

  it('should say there are no reviews yet when the review count is 0', () => {
    renderCard({ rating: 0, reviewCount: 0 })
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('should color the rating star with the rating token', () => {
    const { container } = renderCard()
    expect(container.querySelector('[data-rating] svg')).toHaveClass('text-status-rating')
  })

  it('should render repeated category names without key clashes', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderCard({ categories: ['SEO', 'SEO'] })
    expect(screen.getAllByText('SEO')).toHaveLength(2)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('should keep actions clickable outside the card link', async () => {
    const user = userEvent.setup()
    const onCompare = vi.fn()
    renderCard({ actions: <button type="button" onClick={onCompare}>Compare</button> })
    const button = screen.getByRole('button', { name: 'Compare' })
    expect(button.closest('a')).toBeNull()
    await user.click(button)
    expect(onCompare).toHaveBeenCalledTimes(1)
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<VendorCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading vendor')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<VendorCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
