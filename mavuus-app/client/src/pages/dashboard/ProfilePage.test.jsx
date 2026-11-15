import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import ProfilePage from './ProfilePage'

const updateUser = vi.hoisted(() => vi.fn())
vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => ({ ...demoAuth, updateUser }) }
})

const baseProfile = {
  id: 7,
  email: 'demo@mavuus.com',
  name: 'Demo User',
  title: 'Marketing Director',
  company: 'Mavuus',
  avatar_url: '/images/avatars/avatar-06.webp',
  membership_tier: 'pro',
  created_at: '2025-11-02T10:00:00Z',
  bio: 'Community builder.',
  industry: 'Professional Services',
  years_experience: 10,
  linkedin_url: 'https://linkedin.com/in/demouser',
  website_url: null,
  location: 'New York, NY',
  timezone: 'America/New_York',
  resume_filename: 'demo-resume.pdf',
  resume_url: '/api/files/resumes/abc.pdf',
  profile_visibility: 'public',
  notification_email: 1,
  notification_messages: 1,
  notification_connections: 1,
  notification_jobs: 0,
  skills: ['SEO', 'ABM', 'Brand Strategy'],
  experience: [{ id: 9, title: 'Marketing Director', company: 'Mavuus', start_date: '2024-01', end_date: null, is_current: 1, description: 'Growing the community.' }],
  connections_count: 7,
}

function Where() {
  return <output data-testid="where">{useLocation().search}</output>
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  updateUser.mockReset()
})

function renderPage(url = '/dashboard/profile', routes = {}, profile = baseProfile) {
  const fetchMock = mockApi({
    'GET /api/profile/me': profile,
    'GET /api/reviews/user/7': [],
    'GET /api/recommendations/user/7': [{ id: 1, from_name: 'Jennifer Martinez', from_title: 'VP Marketing', message: 'Great partner.', created_at: '2026-03-01T10:00:00Z' }],
    'PUT /api/profile/me': { success: true },
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[url]}>
      <ProfilePage />
      <Where />
    </MemoryRouter>,
  )
  return fetchMock
}

const calls = (fetchMock, method, url) => fetchMock.mock.calls.filter(([u, init]) => u === url && (init?.method || 'GET') === method)
const lastBody = (fetchMock, method, url) => JSON.parse(calls(fetchMock, method, url).at(-1)[1].body)

describe('ProfilePage', () => {
  it('should show the summary, the About tab and recommendations, without a page h1', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { level: 2, name: 'Demo User' })).toBeInTheDocument()
    expect(screen.getByText('Pro member')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '7 connections' })).toHaveAttribute('href', '/dashboard/members?filter=connections')
    expect(screen.getByRole('tab', { name: 'About' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Great partner.')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('should open the tab the URL names and keep tab changes in the URL', async () => {
    const user = userEvent.setup()
    renderPage('/dashboard/profile?tab=account')
    expect(await screen.findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('demo@mavuus.com')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Experience' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?tab=experience'))
    await user.click(screen.getByRole('tab', { name: 'About' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent(/^$/))
  })

  it('should list what is missing and go to the tab where it is done', async () => {
    const user = userEvent.setup()
    renderPage('/dashboard/profile', {}, { ...baseProfile, experience: [], resume_filename: null, resume_url: null })
    expect(await screen.findByRole('progressbar', { name: 'Profile 60% complete' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Upload a resume' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?tab=experience'))
  })

  it('should save only the changed personal fields, with Save off until something changed', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Edit personal information' }))
    const save = screen.getByRole('button', { name: 'Save changes' })
    expect(save).toBeDisabled()
    const title = screen.getByRole('textbox', { name: 'Job title' })
    await user.clear(title)
    await user.type(title, 'VP Marketing')
    await user.click(save)
    await waitFor(() => expect(success).toHaveBeenCalledWith('Profile updated', undefined))
    expect(lastBody(fetchMock, 'PUT', '/api/profile/me')).toEqual({ title: 'VP Marketing' })
    expect(updateUser).toHaveBeenCalledWith({ title: 'VP Marketing' })
    expect(screen.getByRole('button', { name: 'Edit personal information' })).toHaveFocus()
  })

  it('should show field errors and not save an empty name', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Edit personal information' }))
    await user.clear(screen.getByRole('textbox', { name: /Full name/ }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('textbox', { name: /Full name/ })).toHaveAccessibleDescription(/Enter your name/)
    expect(calls(fetchMock, 'PUT', '/api/profile/me')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Demo User', { selector: 'dd *, dd' })).toBeInTheDocument()
  })

  it('should refuse a link that is not http and show the server error when a save fails', async () => {
    const user = userEvent.setup()
    renderPage('/dashboard/profile', { 'PUT /api/profile/me': reply(400, { error: 'Bio can be 2000 characters at most' }) })
    await user.click(await screen.findByRole('button', { name: 'Edit about' }))
    const website = screen.getByRole('textbox', { name: 'Website' })
    await user.type(website, 'javascript:alert(1)')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(website).toHaveAccessibleDescription(/https:\/\//)
    await user.clear(website)
    await user.type(website, 'https://demo.example')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Bio can be 2000 characters at most')).toBeInTheDocument()
    expect(website).toHaveValue('https://demo.example')
  })

  it('should add a skill and remove one', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/profile', {
      'POST /api/profile/me/skills': reply(201, { success: true }),
      'DELETE /api/profile/me/skills/Brand%20Strategy': { success: true },
    })
    await user.type(await screen.findByRole('textbox', { name: 'Add a skill' }), 'Lifecycle Marketing{Enter}')
    const skills = screen.getByRole('list', { name: 'Your skills' })
    expect(await within(skills).findByRole('button', { name: 'Remove Lifecycle Marketing' })).toBeInTheDocument()
    expect(lastBody(fetchMock, 'POST', '/api/profile/me/skills')).toEqual({ skill: 'Lifecycle Marketing' })
    await user.click(within(skills).getByRole('button', { name: 'Remove Brand Strategy' }))
    await waitFor(() => expect(within(skills).queryByRole('button', { name: 'Remove Brand Strategy' })).not.toBeInTheDocument())
    await user.type(screen.getByRole('textbox', { name: 'Add a skill' }), 'seo{Enter}')
    expect(screen.getByRole('textbox', { name: 'Add a skill' })).toHaveAccessibleDescription(/already on your profile/)
  })

  it('should check a new role and add it', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/profile?tab=experience', { 'POST /api/profile/me/experience': reply(201, { id: 10 }) })
    await user.click(await screen.findByRole('button', { name: 'Add experience' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add experience' })
    await user.click(within(dialog).getByRole('button', { name: 'Add experience' }))
    expect(within(dialog).getByRole('textbox', { name: /Job title/ })).toHaveAccessibleDescription(/Enter a job title/)
    await user.type(within(dialog).getByRole('textbox', { name: /Job title/ }), 'Head of Growth')
    await user.type(within(dialog).getByRole('textbox', { name: /Company/ }), 'Acme')
    await user.click(within(dialog).getByRole('checkbox', { name: 'I currently work here' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add experience' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(lastBody(fetchMock, 'POST', '/api/profile/me/experience')).toMatchObject({ title: 'Head of Growth', company: 'Acme', is_current: true, end_date: '' })
  })

  it('should confirm before removing a role and keep the dialog open when it fails', async () => {
    const user = userEvent.setup()
    let fail = true
    const fetchMock = renderPage('/dashboard/profile?tab=experience', {
      'DELETE /api/profile/me/experience/9': () => (fail ? reply(500, { error: 'Database busy' }) : { success: true }),
    })
    await user.click(await screen.findByRole('button', { name: 'Delete Marketing Director at Mavuus' }))
    const dialog = await screen.findByRole('dialog', { name: 'Remove this role?' })
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))
    expect(await within(dialog).findByText('Database busy')).toBeInTheDocument()
    fail = false
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(calls(fetchMock, 'DELETE', '/api/profile/me/experience/9')).toHaveLength(2)
  })

  it('should link the resume through the private route, check uploads and remove it', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const fetchMock = renderPage('/dashboard/profile?tab=experience', {
      'POST /api/profile/me/resume': { success: true, filename: 'new-cv.pdf', url: '/api/files/resumes/new.pdf' },
      'DELETE /api/profile/me/resume': { success: true },
    })
    expect(await screen.findByRole('link', { name: /demo-resume\.pdf/ })).toHaveAttribute('href', '/api/files/resumes/abc.pdf')
    const input = screen.getByLabelText('Resume file')
    await user.upload(input, new File(['x'], 'cv.docx', { type: 'application/msword' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Upload a PDF file.')
    expect(calls(fetchMock, 'POST', '/api/profile/me/resume')).toHaveLength(0)
    await user.upload(input, new File(['%PDF-1.4'], 'new-cv.pdf', { type: 'application/pdf' }))
    expect(await screen.findByRole('link', { name: /new-cv\.pdf/ })).toHaveAttribute('href', '/api/files/resumes/new.pdf')
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByRole('button', { name: 'Upload resume' })).toBeInTheDocument()
  })

  it('should check the photo, upload it and update the signed-in user', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const fetchMock = renderPage('/dashboard/profile', { 'POST /api/profile/me/avatar': { success: true, avatar_url: '/uploads/avatars/new.png' } })
    const input = await screen.findByLabelText('Profile photo file')
    await user.upload(input, new File([new Uint8Array(3 * 1024 * 1024)], 'big.png', { type: 'image/png' }))
    expect(screen.getByRole('alert')).toHaveTextContent('over 2 MB')
    expect(calls(fetchMock, 'POST', '/api/profile/me/avatar')).toHaveLength(0)
    await user.upload(input, new File(['png'], 'me.png', { type: 'image/png' }))
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ avatar_url: '/uploads/avatars/new.png' }))
  })

  it('should save a notification switch right away and flip it back when the save fails', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const fetchMock = renderPage('/dashboard/profile?tab=account', { 'PUT /api/profile/me': reply(500, {}) })
    const jobs = await screen.findByRole('switch', { name: 'Jobs' })
    expect(jobs).not.toBeChecked()
    await user.click(jobs)
    await waitFor(() => expect(error).toHaveBeenCalled())
    expect(lastBody(fetchMock, 'PUT', '/api/profile/me')).toEqual({ notification_jobs: 1 })
    expect(jobs).not.toBeChecked()
  })

  it('should save the visibility only after Save', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/profile?tab=account')
    await user.click(await screen.findByRole('radio', { name: /Connections only/ }))
    expect(calls(fetchMock, 'PUT', '/api/profile/me')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Save visibility' }))
    await waitFor(() => expect(calls(fetchMock, 'PUT', '/api/profile/me')).toHaveLength(1))
    expect(lastBody(fetchMock, 'PUT', '/api/profile/me')).toEqual({ profile_visibility: 'connections' })
  })

  it('should check a new password and show a wrong current password on its field', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/profile?tab=account', {
      'PUT /api/auth/change-password': reply(401, { error: 'Current password is incorrect' }),
    })
    const current = await screen.findByLabelText(/Current password/)
    await user.type(current, 'wrong')
    await user.type(screen.getByLabelText(/^New password/), 'Password9')
    await user.type(screen.getByLabelText(/Confirm new password/), 'Password8')
    await user.click(screen.getByRole('button', { name: 'Update password' }))
    expect(screen.getByLabelText(/Confirm new password/)).toHaveAccessibleDescription(/don't match/)
    expect(calls(fetchMock, 'PUT', '/api/auth/change-password')).toHaveLength(0)
    await user.clear(screen.getByLabelText(/Confirm new password/))
    await user.type(screen.getByLabelText(/Confirm new password/), 'Password9')
    await user.click(screen.getByRole('button', { name: 'Update password' }))
    await waitFor(() => expect(current).toHaveAccessibleDescription(/Current password is incorrect/))
    expect(lastBody(fetchMock, 'PUT', '/api/auth/change-password')).toEqual({ currentPassword: 'wrong', newPassword: 'Password9' })
  })

  it('should show an error with Try again when the profile fails to load', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage('/dashboard/profile', { 'GET /api/profile/me': () => (fail ? reply(500, {}) : baseProfile) })
    expect(await screen.findByText("We couldn't load your profile")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Demo User' })).toBeInTheDocument()
  })
})
