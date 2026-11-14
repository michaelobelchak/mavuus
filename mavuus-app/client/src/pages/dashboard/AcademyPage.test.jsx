import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { demoAuth, mockApi } from '../../test/mockApi'
import AcademyPage from './AcademyPage'
import { profileCompletion } from './academy/profileCompletion'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth: auth } = await import('../../test/mockApi')
  return { useAuth: () => auth }
})

const sessions = [
  { id: 1, type: 'live', title: 'Building a Content Engine', category: 'Content Strategy', scheduled_date: '2026-03-20', duration: '60 min', speaker_name: 'Sarah Chen', speaker_title: 'VP of Marketing, TechFlow' },
  { id: 7, type: 'on-demand', title: 'Mastering LinkedIn Ads', category: 'Paid Media', duration: '42 min', views: 1240, speaker_name: 'Elena Rodriguez', speaker_title: 'CMO, Drift' },
]
const resources = [{ id: 3, title: 'Budget Template', category: 'Template', description: 'Plan spend.', author: 'Mavuus Team', read_time: '5 min read' }]
const fullProfile = { avatar_url: '/a.webp', bio: 'Hi', skills: ['a', 'b', 'c'], experience: [{}], resume_filename: 'cv.pdf' }

function renderPage(profile = fullProfile) {
  mockApi({
    'GET /api/sessions': { data: sessions },
    'GET /api/resources': { data: resources },
    'GET /api/profile/me': profile,
  })
  return render(
    <MemoryRouter>
      <AcademyPage />
    </MemoryRouter>,
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('AcademyPage', () => {
  it('should greet the member and leave the h1 to the shell', async () => {
    renderPage()
    expect(screen.getByText(/Welcome back, Demo\./)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 3, name: 'Building a Content Engine' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Upcoming Live Sessions' })).toBeInTheDocument()
  })

  it('should link the cards and the View all links to their pages', async () => {
    renderPage()
    expect(await screen.findByRole('link', { name: 'Building a Content Engine' })).toHaveAttribute('href', '/dashboard/live-sessions/1')
    expect(screen.getByRole('link', { name: 'Mastering LinkedIn Ads' })).toHaveAttribute('href', '/dashboard/on-demand/7')
    expect(screen.getByRole('link', { name: 'Budget Template' })).toHaveAttribute('href', '/dashboard/resources/3')
    expect(screen.getByRole('link', { name: 'View all live sessions' })).toHaveAttribute('href', '/dashboard/live-sessions')
  })

  it('should show only the picked section when a filter chip is chosen', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('link', { name: 'Budget Template' })
    await user.click(screen.getByRole('button', { name: 'Resources' }))
    expect(screen.getByRole('button', { name: 'Resources' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('heading', { name: 'Upcoming Live Sessions' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Past Speakers' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Community Resources' })).toBeInTheDocument()
  })

  it('should list past speakers from the sessions', async () => {
    renderPage()
    const section = (await screen.findByRole('heading', { name: 'Past Speakers' })).closest('section')
    expect(within(section).getByText('Sarah Chen')).toBeInTheDocument()
    expect(within(section).getByText('TechFlow')).toBeInTheDocument()
  })

  it('should nudge an incomplete profile and stay quiet for a complete one', async () => {
    const { unmount } = renderPage({ ...fullProfile, bio: '', resume_filename: null })
    expect(await screen.findByRole('heading', { name: 'Complete your profile' })).toBeInTheDocument()
    expect(screen.getByText(/Add a bio and a resume/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Complete profile' })).toHaveAttribute('href', '/dashboard/profile')
    unmount()
    renderPage()
    await screen.findByRole('link', { name: 'Budget Template' })
    expect(screen.queryByRole('heading', { name: 'Complete your profile' })).not.toBeInTheDocument()
  })

  it('should score a profile by the five sidebar checks', () => {
    expect(profileCompletion(fullProfile)).toEqual({ percent: 100, missing: [] })
    expect(profileCompletion({}).percent).toBe(0)
    expect(profileCompletion(null)).toBeNull()
    expect(demoAuth.user.name).toBe('Demo User')
  })
})
