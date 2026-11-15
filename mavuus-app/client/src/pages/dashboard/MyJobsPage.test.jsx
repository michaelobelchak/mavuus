import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import MyJobsPage from './MyJobsPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => ({ ...demoAuth, user: { ...demoAuth.user, company: 'Mavuus' } }) }
})

const applications = [
  {
    id: 1,
    job_id: 1,
    job_title: 'Senior Content Strategist',
    job_company: 'TechFlow',
    job_location: 'Remote',
    job_type: 'full-time',
    status: 'reviewing',
    applied_at: '2026-03-02T10:00:00Z',
  },
]
const saved = [{ id: 5, title: 'Content Marketing Manager', company: 'Notion', location: 'Remote', type: 'full-time' }]
const postings = [
  { id: 8, title: 'Freelance SEO Consultant', company: 'Mavuus', status: 'open', applicant_count: 2, created_at: '2026-03-07T10:00:00Z' },
]

function Where() {
  return <output data-testid="where">{useLocation().search}</output>
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(url = '/dashboard/my-jobs', routes = {}) {
  const fetchMock = mockApi({
    'GET /api/jobs/my-applications': applications,
    'GET /api/jobs/saved': saved,
    'GET /api/jobs/my-postings': postings,
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[url]}>
      <MyJobsPage />
      <Where />
    </MemoryRouter>,
  )
  return fetchMock
}

describe('MyJobsPage', () => {
  it('should open on the applications tab with the status of each application and no page h1', async () => {
    renderPage()
    expect(await screen.findByRole('link', { name: 'Senior Content Strategist' })).toHaveAttribute('href', '/dashboard/jobs/1')
    expect(screen.getByRole('tab', { name: 'Applications (1)' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Saved (1)' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Postings (1)' })).toBeInTheDocument()
    expect(screen.getByText('Reviewing')).toBeInTheDocument()
    expect(screen.getByText('Applied Mar 2, 2026')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('should keep the active tab in the URL', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('tab', { name: 'Postings (1)' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?tab=postings'))
    expect(screen.getByRole('link', { name: 'Freelance SEO Consultant' })).toHaveAttribute('href', '/dashboard/jobs/8')
    expect(screen.getByText('2 applicants')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Applications (1)' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent(/^$/))
  })

  it('should open the tab the URL names and remove a saved job', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage('/dashboard/my-jobs?tab=saved', { 'DELETE /api/jobs/5/save': { success: true } })
    await user.click(await screen.findByRole('button', { name: 'Remove Content Marketing Manager from saved jobs' }))
    expect(await screen.findByRole('heading', { name: 'No saved jobs' })).toBeInTheDocument()
    expect(success).toHaveBeenCalledWith('Job removed from saved', undefined)
    expect(screen.getByRole('tab', { name: 'Saved (0)' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/jobs/5/save')).toHaveLength(1)
  })

  it('should show an empty state with a way forward on each empty tab', async () => {
    renderPage('/dashboard/my-jobs', {
      'GET /api/jobs/my-applications': [],
      'GET /api/jobs/my-postings': [],
    })
    expect(await screen.findByRole('heading', { name: 'No applications yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse Jobs' })).toHaveAttribute('href', '/dashboard/jobs')
  })

  it('should post a job, then show it on the postings tab', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    let mine = []
    const fetchMock = renderPage('/dashboard/my-jobs', {
      'GET /api/jobs/my-postings': () => mine,
      'POST /api/jobs': () => {
        mine = [{ id: 30, title: 'Lifecycle Lead', company: 'Mavuus', status: 'open', applicant_count: 0 }]
        return reply(201, { id: 30 })
      },
    })
    await user.click(await screen.findByRole('button', { name: 'Post a Job' }))
    const dialog = await screen.findByRole('dialog', { name: 'Post a New Job' })
    expect(within(dialog).getByRole('textbox', { name: /Company/ })).toHaveValue('Mavuus')
    expect(within(dialog).getByRole('button', { name: 'Post Job' })).toBeDisabled()
    await user.type(within(dialog).getByRole('textbox', { name: /Job title/ }), 'Lifecycle Lead')
    await user.click(within(dialog).getByRole('combobox', { name: 'Job type' }))
    await user.click(await screen.findByRole('option', { name: 'Contract' }))
    await user.click(within(dialog).getByRole('button', { name: 'Post Job' }))
    await waitFor(() => expect(success).toHaveBeenCalledWith('Job posted!', undefined))
    const [, init] = fetchMock.mock.calls.find(([url, options]) => url === '/api/jobs' && options?.method === 'POST')
    expect(JSON.parse(init.body)).toEqual({
      title: 'Lifecycle Lead',
      company: 'Mavuus',
      description: '',
      location: '',
      type: 'contract',
      category: '',
      salary_range: '',
    })
    expect(await screen.findByRole('link', { name: 'Lifecycle Lead' })).toBeInTheDocument()
    expect(screen.getByTestId('where')).toHaveTextContent('?tab=postings')
  })

  it('should show the server error when posting fails', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage('/dashboard/my-jobs', { 'POST /api/jobs': reply(400, { error: 'Title must be 200 characters or less' }) })
    await user.click(await screen.findByRole('button', { name: 'Post a Job' }))
    const dialog = await screen.findByRole('dialog', { name: 'Post a New Job' })
    await user.type(within(dialog).getByRole('textbox', { name: /Job title/ }), 'X')
    await user.click(within(dialog).getByRole('button', { name: 'Post Job' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('Title must be 200 characters or less', undefined))
  })

  it('should show an error with Try again on the one tab whose list failed, and keep the others working', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage('/dashboard/my-jobs', { 'GET /api/jobs/saved': () => (fail ? reply(500, {}) : saved) })
    // The applications tab still loads.
    expect(await screen.findByRole('link', { name: 'Senior Content Strategist' })).toBeInTheDocument()
    expect(screen.queryByText("We couldn't load your saved jobs")).not.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Saved' }))
    expect(await screen.findByText("We couldn't load your saved jobs")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: 'Content Marketing Manager' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Saved (1)' })).toBeInTheDocument()
  })

  it('should show an application for a job that is gone without a link and say it is no longer available', async () => {
    renderPage('/dashboard/my-jobs', {
      'GET /api/jobs/my-applications': [{ ...applications[0], unavailable: true }],
    })
    expect(await screen.findByRole('heading', { name: 'Senior Content Strategist' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Senior Content Strategist' })).not.toBeInTheDocument()
    expect(screen.getByText('No longer available')).toBeInTheDocument()
  })
})
