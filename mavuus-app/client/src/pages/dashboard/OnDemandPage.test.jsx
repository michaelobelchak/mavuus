import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi } from '../../test/mockApi'
import OnDemandPage from './OnDemandPage'

const videos = [{ id: 7, type: 'on-demand', title: 'Mastering LinkedIn Ads', category: 'Paid Media', duration: '42 min', views: 1240, speaker_name: 'Elena Rodriguez' }]

afterEach(() => vi.unstubAllGlobals())

describe('OnDemandPage', () => {
  it('should list recordings with their views and filter by category', async () => {
    const user = userEvent.setup()
    const fetchMock = mockApi({ 'GET /api/sessions': { data: videos, totalPages: 1 } })
    render(
      <MemoryRouter>
        <OnDemandPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('link', { name: 'Mastering LinkedIn Ads' })).toHaveAttribute('href', '/dashboard/on-demand/7')
    expect(screen.getByText('1,240 views')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'SEO' }))
    await waitFor(() => {
      const query = new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams
      expect(query.get('type')).toBe('on-demand')
      expect(query.get('category')).toBe('SEO')
    })
  })
})
