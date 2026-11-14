import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import VendorDetailPage from './VendorDetailPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const vendor = {
  id: 1,
  user_id: 3,
  company_name: 'ContentPro Agency',
  description: 'Full-service content marketing.',
  categories: ['Content Marketing', 'SEO'],
  rating: 4.5,
  reviews_count: 1,
  location: 'New York, NY',
  website: 'https://contentpro.example',
}
const review = { id: 8, reviewer_name: 'Sarah Chen', rating: 5, text: 'Transformed our pipeline.', created_at: '2026-02-15 10:00:00' }

function Where() {
  const location = useLocation()
  return <output data-testid="where">{`${location.pathname}${location.search}`}</output>
}

function renderPage(id = 1, routes = {}) {
  const fetchMock = mockApi({
    'GET /api/vendors/1': vendor,
    'GET /api/jobs?posted_by=3': { data: [{ id: 5, title: 'Content Writer', posted_by: 3, location: 'Remote', type: 'contract', category: 'Content' }] },
    'GET /api/reviews/vendor/1': [review],
    'GET /api/recommendations/vendor/1': [{ id: 2, from_name: 'Marcus Johnson', message: 'Highly recommend.' }],
    'GET /api/comments': [],
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[`/dashboard/vendors/${id}`]}>
      <Routes>
        <Route path="/dashboard/vendors/:id" element={<VendorDetailPage />} />
        <Route path="*" element={null} />
      </Routes>
      <Where />
    </MemoryRouter>,
  )
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('VendorDetailPage', () => {
  it('should show the vendor as an h2 with its jobs, reviews, recommendations, comments and details', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { level: 2, name: 'ContentPro Agency' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Vendors' })).toHaveAttribute('href', '/dashboard/vendors')
    expect(screen.getByRole('img', { name: '4.5 out of 5 stars' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Content Writer' })).toHaveAttribute('href', '/dashboard/jobs/5')
    expect(screen.getByRole('article', { name: 'Review by Sarah Chen' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Recommendation from Marcus Johnson' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Comments/ })).toBeInTheDocument()
    const info = screen.getByRole('complementary', { name: 'Vendor info' })
    expect(within(info).getByRole('link', { name: /Visit Website/ })).toHaveAttribute('href', 'https://contentpro.example')
    expect(within(info).getByText('New York, NY')).toBeInTheDocument()
  })

  it('should submit a review from the dialog and reload the reviews and the rating', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    let reviews = [review]
    const fetchMock = renderPage(1, {
      'GET /api/reviews/vendor/1': () => reviews,
      'POST /api/reviews': () => {
        reviews = [{ id: 9, reviewer_name: 'Demo User', rating: 4, text: 'Solid work.' }, review]
        return { id: 9 }
      },
    })
    await user.click(await screen.findByRole('button', { name: 'Write a Review' }))
    const dialog = await screen.findByRole('dialog', { name: 'Review ContentPro Agency' })
    expect(within(dialog).getByRole('button', { name: 'Submit Review' })).toBeDisabled()
    await user.click(within(dialog).getByRole('radio', { name: '4 stars' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Your Review' }), 'Solid work.')
    await user.click(within(dialog).getByRole('button', { name: 'Submit Review' }))
    expect(await screen.findByRole('article', { name: 'Review by Demo User' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reviews (2)' })).toBeInTheDocument()
    const [, init] = fetchMock.mock.calls.find(([url, options]) => url === '/api/reviews' && options?.method === 'POST')
    expect(JSON.parse(init.body)).toEqual({ reviewee_id: 3, vendor_id: 1, rating: 4, text: 'Solid work.' })
  })

  it('should start a conversation with the vendor and open it', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage(1, { 'POST /api/messages/conversations': { conversationId: 44 } })
    await user.click(await screen.findByRole('button', { name: 'Contact Vendor' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/messages?conversation=44'))
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/api/messages/conversations')
    expect(JSON.parse(init.body)).toEqual({ userId: 3, message: "Hi ContentPro Agency, I'd like to connect about your services." })
  })

  it('should disable Contact Vendor, say why and skip the jobs request when the vendor has no account', async () => {
    const fetchMock = renderPage(1, { 'GET /api/vendors/1': { ...vendor, user_id: null } })
    expect(await screen.findByRole('button', { name: 'Contact Vendor' })).toBeDisabled()
    expect(screen.getByText("Direct messages aren't set up for this vendor yet.")).toBeInTheDocument()
    await screen.findByRole('article', { name: 'Review by Sarah Chen' })
    expect(fetchMock.mock.calls.some(([url]) => url.startsWith('/api/jobs'))).toBe(false)
  })

  it('should open the share dialog', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Share' }))
    expect(await screen.findByRole('dialog', { name: 'Share ContentPro Agency' })).toBeInTheDocument()
  })

  it('should tell a missing vendor from a failed load', async () => {
    renderPage(99, { 'GET /api/vendors/99': reply(404, { error: 'Vendor not found' }) })
    expect(await screen.findByRole('heading', { name: 'Vendor not found' })).toBeInTheDocument()
  })

  it('should offer Try again when the vendor fails to load', async () => {
    renderPage(1, { 'GET /api/vendors/1': reply(500, { error: 'boom' }) })
    expect(await screen.findByText("We couldn't load this vendor")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
