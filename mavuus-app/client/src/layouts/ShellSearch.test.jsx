import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockViewport } from '@/design-system/test/browserMocks'
import { ShellSearch } from './ShellSearch'

const results = {
  sessions: [
    { id: 1, title: 'Growth loops', speaker_name: 'Leah Andrew', type: 'live' },
    { id: 2, title: 'Growth recording', speaker_name: 'Alex', type: 'on-demand' },
  ],
  resources: [],
  members: [{ id: 5, name: 'Grace Hopper', title: 'CMO', company: 'Acme' }],
  vendors: [],
  jobs: [{ id: 9, title: 'Head of Growth', company: 'TechFlow' }],
}

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <button type="button">Outside</button>
      <ShellSearch />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

let fetchMock
beforeEach(() => {
  mockViewport(1440)
  fetchMock = vi.fn(async () => ({ ok: true, json: async () => results }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ShellSearch', () => {
  it('should search once typing pauses and list the results as links by section', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox', { name: 'Search sessions, resources, members' }), 'growth')
    const panel = await screen.findByRole('region', { name: 'Search results' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/search?q=growth')
    expect(within(panel).getByRole('link', { name: /Growth loops/ })).toHaveAttribute('href', '/dashboard/live-sessions/1')
    expect(within(panel).getByRole('link', { name: /Growth recording/ })).toHaveAttribute('href', '/dashboard/on-demand/2')
    expect(within(panel).getByRole('link', { name: /Grace Hopper/ })).toHaveAttribute('href', '/dashboard/members/5')
    expect(within(panel).getByRole('link', { name: /Head of Growth/ })).toHaveAttribute('href', '/dashboard/jobs/9')
    expect(within(panel).queryByRole('heading')).not.toBeInTheDocument()
    expect(within(panel).getByRole('group', { name: 'Sessions' })).toContainElement(
      within(panel).getByRole('link', { name: /Growth loops/ }),
    )
    expect(within(panel).queryByRole('group', { name: 'Vendors' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('4 results')
  })

  it('should hint the / shortcut in the empty field from 768px only', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSearch()
    expect(screen.getByText('/', { selector: 'kbd' })).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'g')
    expect(screen.queryByText('/', { selector: 'kbd' })).not.toBeInTheDocument()
    unmount()
    mockViewport(390)
    renderSearch()
    expect(screen.queryByText('/', { selector: 'kbd' })).not.toBeInTheDocument()
  })

  it('should not search for fewer than two characters', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox'), 'g')
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument()
  })

  it('should say when nothing matches', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ sessions: [], resources: [], members: [], vendors: [], jobs: [] }) })
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(await screen.findByText('No results for "zzz"')).toBeInTheDocument()
  })

  it('should go to a result, then clear the field and close the results', async () => {
    const user = userEvent.setup()
    renderSearch()
    const field = screen.getByRole('searchbox')
    await user.type(field, 'growth')
    await user.click(await screen.findByRole('link', { name: /Head of Growth/ }))
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/jobs/9')
    expect(field).toHaveValue('')
    expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument()
  })

  it('should close the results on an outside click and show them again on focus', async () => {
    const user = userEvent.setup()
    renderSearch()
    const field = screen.getByRole('searchbox')
    await user.type(field, 'growth')
    await screen.findByRole('region', { name: 'Search results' })
    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument()
    await user.click(field)
    expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument()
  })

  it('should keep focus in the field on mousedown so a click on a result lands (Safari)', async () => {
    const user = userEvent.setup()
    renderSearch()
    const field = screen.getByRole('searchbox')
    await user.type(field, 'growth')
    const link = await screen.findByRole('link', { name: /Head of Growth/ })
    // Safari doesn't focus a link on click, so focus would leave to <body> and close the panel
    // before the click. Preventing mousedown's default keeps focus in the field.
    expect(fireEvent.mouseDown(link)).toBe(false)
    expect(field).toHaveFocus()
    expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument()
    fireEvent.click(link)
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/jobs/9')
  })

  it('should close the results when focus leaves the search', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox'), 'growth')
    const link = await screen.findByRole('link', { name: /Head of Growth/ })
    act(() => link.focus())
    expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument()
    act(() => screen.getByRole('button', { name: 'Outside' }).focus())
    expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument()
  })

  it('should close the results with Escape from a result and put focus back in the field', async () => {
    const user = userEvent.setup()
    renderSearch()
    const field = screen.getByRole('searchbox')
    await user.type(field, 'growth')
    const first = (await screen.findAllByRole('link'))[0]
    act(() => first.focus())
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument()
    expect(field).toHaveFocus()
    expect(field).toHaveValue('growth')
  })

  it('should say search is unavailable when the request fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox'), 'growth')
    const panel = await screen.findByRole('region', { name: 'Search results' })
    expect(panel).toHaveTextContent("Search isn't available right now. Try again in a moment.")
    expect(within(panel).queryByRole('link')).not.toBeInTheDocument()
  })

  it('should clear the results with Escape', async () => {
    const user = userEvent.setup()
    renderSearch()
    const field = screen.getByRole('searchbox')
    await user.type(field, 'growth')
    await screen.findByRole('region', { name: 'Search results' })
    await user.keyboard('{Escape}')
    expect(field).toHaveValue('')
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Search results' })).not.toBeInTheDocument())
  })
})
