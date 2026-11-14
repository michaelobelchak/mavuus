import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi } from '../../test/mockApi'
import VendorsPage from './VendorsPage'

const vendors = [
  {
    id: 1,
    company_name: 'ContentPro Agency',
    description: 'Full-service content marketing.',
    categories: ['Content Marketing', 'SEO'],
    rating: 4.8,
    reviews_count: 12,
    location: 'New York, NY',
  },
]

afterEach(() => vi.unstubAllGlobals())

function renderPage(url = '/dashboard/vendors', routes = { 'GET /api/vendors': { data: vendors, totalPages: 1 } }) {
  const fetchMock = mockApi(routes)
  render(
    <MemoryRouter initialEntries={[url]}>
      <VendorsPage />
    </MemoryRouter>,
  )
  return fetchMock
}

describe('VendorsPage', () => {
  it('should list vendors as cards linking to their profile, with no page h1', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('link', { name: 'ContentPro Agency' })).toHaveAttribute('href', '/dashboard/vendors/1')
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    const query = new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams
    expect(query.get('page')).toBe('1')
    expect(query.get('limit')).toBe('20')
    expect(query.has('category')).toBe(false)
  })

  it('should send the category chip and the search to /api/vendors', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'ContentPro Agency' })
    await user.click(screen.getByRole('button', { name: 'Branding' }))
    await waitFor(() => expect(new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams.get('category')).toBe('Branding'))
    await user.type(screen.getByRole('searchbox', { name: 'Search vendors' }), 'pro')
    await waitFor(() => expect(new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams.get('search')).toBe('pro'))
  })

  it('should show the empty state when nothing matches', async () => {
    renderPage('/dashboard/vendors?q=zzz', { 'GET /api/vendors': { data: [], totalPages: 1 } })
    expect(await screen.findByRole('heading', { name: 'No vendors found' })).toBeInTheDocument()
  })
})
