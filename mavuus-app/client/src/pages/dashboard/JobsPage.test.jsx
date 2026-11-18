import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import JobsPage from './JobsPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const jobs = [
  {
    id: 3,
    title: 'Freelance Brand Designer',
    company: 'BrandSpark Studio',
    description: '**About**\n\nCreate brand assets.',
    location: 'Remote',
    type: 'freelance',
    category: 'Design',
    salary_range: '$80 - $120/hr',
    seniority: 'Mid',
    created_at: '2026-03-02T10:00:00Z',
  },
  { id: 5, title: 'Content Marketing Manager', company: 'Notion', type: 'full-time', created_at: '2026-03-04T10:00:00Z' },
]

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(url = '/dashboard/jobs', routes = {}) {
  const fetchMock = mockApi({
    'GET /api/jobs': { data: jobs, total: 2, totalPages: 1 },
    'GET /api/jobs/saved': [{ id: 5 }],
    'POST /api/jobs/3/save': reply(201, { success: true }),
    'DELETE /api/jobs/5/save': { success: true },
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[url]}>
      <JobsPage />
    </MemoryRouter>,
  )
  return fetchMock
}

const listQuery = (fetchMock) =>
  new URL(fetchMock.mock.calls.filter(([url]) => url.startsWith('/api/jobs?')).at(-1)[0], 'http://x').searchParams

describe('JobsPage', () => {
  it('should list jobs as cards linking to the job, with the count, the saved state and no page h1', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('link', { name: 'Freelance Brand Designer' })).toHaveAttribute('href', '/dashboard/jobs/3')
    expect(screen.getByText('2 jobs found')).toBeInTheDocument()
    expect(screen.getByText('Freelance')).toBeInTheDocument()
    expect(screen.getByText('$80 - $120/hr')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Content Marketing Manager' })).toHaveAttribute('aria-pressed', 'true'),
    )
    expect(screen.getByRole('button', { name: 'Save Freelance Brand Designer' })).toHaveAttribute('aria-pressed', 'false')
    const query = listQuery(fetchMock)
    expect(query.get('page')).toBe('1')
    expect(query.get('limit')).toBe('20')
  })

  it('should send the type, seniority and category from the URL to /api/jobs', async () => {
    const fetchMock = renderPage('/dashboard/jobs?type=contract&seniority=Senior&category=SEO&q=seo')
    await screen.findByRole('link', { name: 'Freelance Brand Designer' })
    const query = listQuery(fetchMock)
    expect(query.get('type')).toBe('contract')
    expect(query.get('seniority')).toBe('Senior')
    expect(query.get('category')).toBe('SEO')
    expect(query.get('search')).toBe('seo')
    expect(screen.getByRole('combobox', { name: 'Job type' })).toHaveTextContent('Contract')
  })

  it('should filter by a picked job type', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'Freelance Brand Designer' })
    await user.click(screen.getByRole('combobox', { name: 'Job type' }))
    await user.click(await screen.findByRole('option', { name: 'Full-time' }))
    await waitFor(() => expect(listQuery(fetchMock).get('type')).toBe('full-time'))
  })

  it('should save a job and say so', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage()
    const save = await screen.findByRole('button', { name: 'Save Freelance Brand Designer' })
    await user.click(save)
    await waitFor(() => expect(save).toHaveAttribute('aria-pressed', 'true'))
    expect(success).toHaveBeenCalledWith('Job saved!', undefined)
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/jobs/3/save' && init?.method === 'POST')).toBe(true)
  })

  it('should unsave a saved job', async () => {
    const user = userEvent.setup()
    const info = vi.spyOn(toast, 'info').mockImplementation(() => {})
    const fetchMock = renderPage()
    const save = await screen.findByRole('button', { name: 'Save Content Marketing Manager' })
    await waitFor(() => expect(save).toHaveAttribute('aria-pressed', 'true'))
    await user.click(save)
    await waitFor(() => expect(save).toHaveAttribute('aria-pressed', 'false'))
    expect(info).toHaveBeenCalledWith('Job removed from saved', undefined)
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/jobs/5/save' && init?.method === 'DELETE')).toBe(true)
  })

  it('should keep the job as it was and say so when saving fails', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage('/dashboard/jobs', { 'POST /api/jobs/3/save': reply(500, { error: 'boom' }) })
    const save = await screen.findByRole('button', { name: 'Save Freelance Brand Designer' })
    await user.click(save)
    await waitFor(() => expect(error).toHaveBeenCalledWith("Couldn't update your saved jobs. Try again.", undefined))
    expect(save).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show the empty state when nothing matches', async () => {
    renderPage('/dashboard/jobs?q=zzz', { 'GET /api/jobs': { data: [], total: 0, totalPages: 1 } })
    expect(await screen.findByRole('heading', { name: 'No jobs found' })).toBeInTheDocument()
  })

  it('should show an error with Try again when the jobs fail to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPage('/dashboard/jobs', { 'GET /api/jobs': reply(500, {}) })
    expect(await screen.findByText("We couldn't load the jobs")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
