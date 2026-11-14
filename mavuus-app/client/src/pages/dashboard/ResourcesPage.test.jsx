import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi } from '../../test/mockApi'
import ResourcesPage from './ResourcesPage'

const resources = [{ id: 3, title: 'Budget Template', category: 'Template', description: 'Plan spend.', author: 'Mavuus Team', read_time: '5 min read' }]

afterEach(() => vi.unstubAllGlobals())

describe('ResourcesPage', () => {
  it('should list resources and send the type as the category filter', async () => {
    const user = userEvent.setup()
    const fetchMock = mockApi({ 'GET /api/resources': { data: resources, totalPages: 1 } })
    render(
      <MemoryRouter>
        <ResourcesPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('link', { name: 'Budget Template' })).toHaveAttribute('href', '/dashboard/resources/3')
    expect(screen.getByText('5 min read')).toBeInTheDocument()
    expect(new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams.has('type')).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Playbook' }))
    await waitFor(() => expect(new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams.get('category')).toBe('Playbook'))
    expect(screen.getByRole('button', { name: 'Playbook' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('should send the filter under the filterParam it is given', async () => {
    const { CatalogList } = await import('./academy/CatalogList')
    const fetchMock = mockApi({ 'GET /api/things': { data: [], totalPages: 1 } })
    render(
      <MemoryRouter initialEntries={['/things?type=Guide']}>
        <CatalogList
          endpoint="/api/things"
          filterParam="type"
          categories={['All', 'Guide']}
          intro="Things."
          searchLabel="Search things"
          listLabel="Things"
          emptyTitle="No things"
          errorTitle="No luck"
          renderItem={() => null}
          skeleton={() => null}
        />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'No things' })
    expect(new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams.get('type')).toBe('Guide')
  })
})
