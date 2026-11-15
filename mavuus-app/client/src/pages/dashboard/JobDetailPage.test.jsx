import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import JobDetailPage from './JobDetailPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})
vi.mock('../../hooks/useConfetti', () => ({ fireConfetti: vi.fn() }))

// Demo user is id 7.
const openJob = {
  id: 3,
  title: 'Freelance Brand Designer',
  company: 'BrandSpark Studio',
  description: 'Create brand assets.\n\n**Requirements:**\n- 5+ years of brand design\n- A strong portfolio',
  location: 'Remote',
  type: 'freelance',
  category: 'Design',
  salary_range: '$80 - $120/hr',
  seniority: 'Mid',
  status: 'open',
  posted_by: 6,
  poster_name: 'Emma Wilson',
  poster_title: 'Creative Director',
  created_at: '2026-03-02T10:00:00Z',
}
const myJob = { ...openJob, id: 8, title: 'Freelance SEO Consultant', posted_by: 7, poster_name: 'Demo User' }
const completedJob = {
  ...openJob,
  id: 1,
  title: 'Senior Content Strategist',
  status: 'completed',
  posted_by: 1,
  poster_name: 'Sarah Chen',
  hired_user_id: 3,
  hired_name: 'Priya Patel',
}
const applicants = [
  { id: 21, user_id: 2, name: 'Marcus Johnson', user_title: 'CMO', user_company: 'GrowthBase', status: 'reviewing', resume_url: '/uploads/resumes/m.pdf' },
  { id: 22, user_id: 12, name: 'Lisa Park', status: 'applied' },
]

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(id, routes = {}) {
  const fetchMock = mockApi({
    'GET /api/jobs/3': openJob,
    'GET /api/jobs/8': myJob,
    'GET /api/jobs/1': completedJob,
    'GET /api/jobs/saved': [],
    'GET /api/jobs/my-applications': [],
    'GET /api/profile/me': { resume_url: '/uploads/resumes/demo.pdf' },
    'GET /api/jobs/8/applicants': applicants,
    'GET /api/reviews/user/3': [],
    'GET /api/reviews/user/1': [],
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[`/dashboard/jobs/${id}`]}>
      <Routes>
        <Route path="/dashboard/jobs/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return fetchMock
}

const bodyOf = (fetchMock, url, method) => {
  const call = fetchMock.mock.calls.find(([u, init]) => u === url && init?.method === method)
  return call && JSON.parse(call[1].body)
}

describe('JobDetailPage', () => {
  it('should show the job as an h2 with its facts, description, details and poster', async () => {
    renderPage(3)
    expect(await screen.findByRole('heading', { level: 2, name: 'Freelance Brand Designer' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Jobs' })).toHaveAttribute('href', '/dashboard/jobs')
    expect(screen.getByRole('heading', { level: 3, name: 'Requirements:' })).toBeInTheDocument()
    expect(screen.getByText('A strong portfolio')).toBeInTheDocument()
    const info = screen.getByRole('complementary', { name: 'Job info' })
    expect(within(info).getByText('Freelance')).toBeInTheDocument()
    expect(within(info).getByRole('link', { name: 'Emma Wilson' })).toHaveAttribute('href', '/dashboard/members/6')
    expect(within(info).getByRole('button', { name: 'Apply Now' })).toBeInTheDocument()
    expect(within(info).getByRole('button', { name: 'Recommend a Vendor' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Applicants/ })).not.toBeInTheDocument()
  })

  it('should tell a missing job from one that failed to load', async () => {
    renderPage(99)
    expect(await screen.findByRole('heading', { name: 'Job not found' })).toBeInTheDocument()
  })

  it('should show an error with Try again when the job fails to load', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage(3, { 'GET /api/jobs/3': () => (fail ? reply(500, {}) : openJob) })
    expect(await screen.findByText("We couldn't load this job")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Freelance Brand Designer' })).toBeInTheDocument()
  })

  it('should apply with a cover letter and the profile resume, once', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage(3, { 'POST /api/jobs/3/apply': reply(201, { success: true }) })
    // Hold the apply request until both clicks are in.
    let release
    const gate = new Promise((resolve) => {
      release = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn((url, init) => (url === '/api/jobs/3/apply' ? gate.then(() => fetchMock(url, init)) : fetchMock(url, init))),
    )
    await user.click(await screen.findByRole('button', { name: 'Apply Now' }))
    const dialog = await screen.findByRole('dialog', { name: 'Apply for Freelance Brand Designer' })
    await user.type(within(dialog).getByRole('textbox', { name: /Cover letter/ }), 'I love brands.')
    expect(within(dialog).getByRole('radio', { name: 'Use my profile resume' })).toBeChecked()
    const submit = within(dialog).getByRole('button', { name: 'Submit Application' })
    await user.click(submit)
    await user.click(submit)
    release()
    await waitFor(() => expect(success).toHaveBeenCalledWith('Application submitted!', undefined))
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/jobs/3/apply')).toHaveLength(1)
    expect(bodyOf(fetchMock, '/api/jobs/3/apply', 'POST')).toEqual({
      cover_letter: 'I love brands.',
      resume_url: '/uploads/resumes/demo.pdf',
    })
    expect(await screen.findByText('You applied for this position')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Applied' })).toBeDisabled()
  })

  it('should show the server error when an application is refused', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage(3, { 'POST /api/jobs/3/apply': reply(409, { error: 'Already applied to this job' }) })
    await user.click(await screen.findByRole('button', { name: 'Apply Now' }))
    const dialog = await screen.findByRole('dialog', { name: 'Apply for Freelance Brand Designer' })
    await user.click(within(dialog).getByRole('button', { name: 'Submit Application' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('Already applied to this job', undefined))
  })

  it('should show an existing application with its status instead of Apply', async () => {
    renderPage(3, { 'GET /api/jobs/my-applications': [{ id: 4, job_id: 3, status: 'reviewing', applied_at: '2026-03-02T10:00:00Z' }] })
    expect(await screen.findByText('You applied for this position')).toBeInTheDocument()
    expect(screen.getByText('Reviewing')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Apply Now' })).not.toBeInTheDocument()
  })

  it('should let the poster see applicants, hire one after confirming and change the status', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage(8, {
      'PUT /api/jobs/applications/21/status': { success: true },
      'PUT /api/jobs/8': { success: true },
    })
    expect(await screen.findByRole('heading', { name: 'Applicants (2)' })).toBeInTheDocument()
    expect(screen.getByText('You posted this job')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Apply Now' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Recommend a Vendor' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Resume of Marcus Johnson/ })).toHaveAttribute('href', '/uploads/resumes/m.pdf')

    await user.click(screen.getByRole('button', { name: 'Hire Marcus Johnson' }))
    const dialog = await screen.findByRole('dialog', { name: 'Hire Marcus Johnson?' })
    await user.click(within(dialog).getByRole('button', { name: 'Hire' }))
    await waitFor(() => expect(success).toHaveBeenCalledWith('Applicant hired! Job status changed to in progress.', undefined))
    expect(bodyOf(fetchMock, '/api/jobs/applications/21/status', 'PUT')).toEqual({ status: 'hired' })
    expect(screen.getByText('Marcus Johnson was hired for this role')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Hire / })).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Change status' }))
    await user.click(await screen.findByRole('option', { name: 'Completed' }))
    await waitFor(() => expect(success).toHaveBeenCalledWith('Job marked as completed', undefined))
    expect(bodyOf(fetchMock, '/api/jobs/8', 'PUT')).toEqual({ status: 'completed' })
  })

  it('should let the poster review the hire on a completed job and show both reviews', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    let hireReviews = []
    const fetchMock = renderPage(1, {
      'GET /api/jobs/1': { ...completedJob, posted_by: 7, poster_name: 'Demo User' },
      'GET /api/jobs/1/applicants': [],
      'GET /api/reviews/user/3': () => hireReviews,
      'GET /api/reviews/user/7': [{ id: 2, job_id: 1, reviewer_id: 3, reviewer_name: 'Priya Patel', rating: 5, text: 'Great boss.' }],
      'POST /api/reviews': () => {
        hireReviews = [{ id: 9, job_id: 1, reviewer_id: 7, reviewer_name: 'Demo User', rating: 4, text: 'Solid.' }]
        return reply(201, { id: 9 })
      },
    })
    expect(await screen.findByRole('article', { name: 'Review by Priya Patel' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Leave a Review' }))
    const dialog = await screen.findByRole('dialog', { name: 'Leave a Review' })
    await user.click(within(dialog).getByRole('radio', { name: '4 stars' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Your review' }), 'Solid.')
    await user.click(within(dialog).getByRole('button', { name: 'Submit Review' }))
    expect(await screen.findByRole('article', { name: 'Review by Demo User' })).toBeInTheDocument()
    expect(bodyOf(fetchMock, '/api/reviews', 'POST')).toEqual({ reviewee_id: 3, job_id: 1, rating: 4, text: 'Solid.' })
    expect(screen.getByText('You reviewed this job')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Leave a Review' })).not.toBeInTheDocument()
  })

  it('should not offer a review to an applicant who was not hired', async () => {
    renderPage(1, { 'GET /api/jobs/my-applications': [{ id: 1, job_id: 1, status: 'reviewing', applied_at: '2026-03-02' }] })
    expect(await screen.findByText('You applied for this position')).toBeInTheDocument()
    expect(screen.getByText('Priya Patel was hired for this role')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Leave a Review' })).not.toBeInTheDocument()
  })

  it('should recommend a vendor from the /api/vendors list to the poster', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage(3, {
      'GET /api/vendors': { data: [{ id: 4, company_name: 'GrowthLab Analytics', categories: ['Analytics'] }] },
      'POST /api/recommendations': reply(201, { id: 1 }),
    })
    await user.click(await screen.findByRole('button', { name: 'Recommend a Vendor' }))
    const dialog = await screen.findByRole('dialog', { name: 'Recommend a Vendor' })
    await user.click(within(dialog).getByRole('combobox', { name: 'Vendor' }))
    await user.click(await screen.findByRole('option', { name: 'GrowthLab Analytics - Analytics' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Message' }), 'Great with data.')
    await user.click(within(dialog).getByRole('button', { name: 'Send Recommendation' }))
    await waitFor(() => expect(success).toHaveBeenCalledWith('Recommendation sent!', undefined))
    expect(bodyOf(fetchMock, '/api/recommendations', 'POST')).toEqual({ to_user_id: 6, vendor_id: 4, message: 'Great with data.' })
  })

  it('should save the job from the side card and open the share dialog', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    renderPage(3, { 'POST /api/jobs/3/save': reply(201, {}) })
    const save = await screen.findByRole('button', { name: 'Save Job' })
    await user.click(save)
    expect(await screen.findByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Share' }))
    expect(await screen.findByRole('dialog', { name: 'Share Freelance Brand Designer' })).toBeInTheDocument()
  })
})
