import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import InvitePage from './InvitePage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = document.execCommand
const LINK = `${window.location.origin}/register?ref=MAVUUS2026`
const stats = {
  count: 1,
  referrals: [{ id: 30, name: 'Rita Referred', title: 'CMO', company: 'Acme', avatar_url: null, created_at: '2026-03-02T10:00:00Z' }],
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else delete navigator.clipboard
  document.execCommand = originalExecCommand
})

function renderPage(routes = {}) {
  const fetchMock = mockApi({
    'GET /api/referrals/my-code': { code: 'MAVUUS2026' },
    'GET /api/referrals/stats': stats,
    ...routes,
  })
  render(
    <MemoryRouter>
      <InvitePage />
    </MemoryRouter>,
  )
  return fetchMock
}

describe('InvitePage', () => {
  it('should show the invite link, the code and the people who joined, without a page h1', async () => {
    renderPage()
    expect(await screen.findByRole('textbox', { name: 'Invite link' })).toHaveValue(LINK)
    expect(screen.getByText('Your referral code is MAVUUS2026.')).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'People you invited' })
    expect(within(list).getByText('Rita Referred')).toBeInTheDocument()
    expect(within(list).getByText('CMO, Acme')).toBeInTheDocument()
    expect(within(list).getByText('Mar 2, 2026')).toBeInTheDocument()
    expect(screen.getByText("You've invited 1 person.")).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('should copy the link and confirm it', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(LINK)
    expect(success).toHaveBeenCalledWith('Link copied to clipboard', undefined)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('should say so, without claiming success, when copying fails', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
    document.execCommand = vi.fn(() => false)
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Copy' }))
    expect(success).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith("Couldn't copy the link. Select it and copy it instead.", undefined)
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('should open the share dialog with the invite link', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Share or email your link' }))
    const dialog = await screen.findByRole('dialog', { name: 'Share your invite link' })
    expect(within(dialog).getByLabelText('Or copy link')).toHaveValue(LINK)
    expect(within(dialog).getByRole('link', { name: /Share on LinkedIn/ }).getAttribute('href')).toContain(encodeURIComponent(LINK))
  })

  it('should show the empty state before anyone joined', async () => {
    renderPage({ 'GET /api/referrals/stats': { count: 0, referrals: [] } })
    expect(await screen.findByRole('heading', { name: 'No referrals yet' })).toBeInTheDocument()
  })

  it('should show an error with Try again when the link fails to load', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage({ 'GET /api/referrals/my-code': () => (fail ? reply(500, {}) : { code: 'MAVUUS2026' }) })
    expect(await screen.findByText("We couldn't load your invite link")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('textbox', { name: 'Invite link' })).toHaveValue(LINK)
  })

  it('should keep the link when only the referrals fail to load', async () => {
    renderPage({ 'GET /api/referrals/stats': reply(500, {}) })
    expect(await screen.findByRole('textbox', { name: 'Invite link' })).toHaveValue(LINK)
    expect(screen.getByText("We couldn't load your referrals")).toBeInTheDocument()
  })
})
