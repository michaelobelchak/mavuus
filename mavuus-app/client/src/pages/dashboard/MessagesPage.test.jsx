import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import MessagesPage from './MessagesPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const conversations = [
  {
    id: 1,
    other_user_id: 2,
    other_user_name: 'Tom Bradley',
    other_user_title: 'Director of Marketing',
    last_message: 'How about Thursday?',
    last_message_sender_id: 7,
    last_message_at: '2026-03-14T07:00:00Z',
    unread_count: 0,
  },
  {
    id: 2,
    other_user_id: 3,
    other_user_name: 'Jennifer Martinez',
    other_user_title: 'VP Marketing',
    last_message: 'Have you met Priya?',
    last_message_sender_id: 3,
    last_message_at: '2026-03-13T07:00:00Z',
    unread_count: 2,
  },
]
const tomMessages = [
  { id: 11, sender_id: 2, content: 'Hi! Loved your talk.', created_at: '2026-03-14T06:00:00Z' },
  { id: 12, sender_id: 7, content: 'How about Thursday?', created_at: '2026-03-14T07:00:00Z' },
]
const jenMessages = [{ id: 21, sender_id: 3, content: 'Have you met Priya?', created_at: '2026-03-13T07:00:00Z' }]

function Where() {
  return <output data-testid="where">{useLocation().search}</output>
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(url = '/dashboard/messages', routes = {}) {
  const fetchMock = mockApi({
    'GET /api/messages/conversations': conversations,
    'GET /api/messages/conversations/1/messages': tomMessages,
    'GET /api/messages/conversations/2/messages': jenMessages,
    'PUT /api/messages/conversations/1/read': { success: true },
    'PUT /api/messages/conversations/2/read': { success: true },
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[url]}>
      <MessagesPage />
      <Where />
    </MemoryRouter>,
  )
  return fetchMock
}

const posts = (fetchMock, url) => fetchMock.mock.calls.filter(([u, init]) => u === url && init?.method === 'POST')

describe('MessagesPage', () => {
  it('should list conversations with unread counts and ask to pick one, without a page h1', async () => {
    renderPage()
    const list = await screen.findByRole('list', { name: 'Conversations' })
    expect(within(list).getByRole('link', { name: /Tom Bradley/ })).toHaveAttribute('href', '/dashboard/messages?conversation=1')
    expect(within(list).getByRole('link', { name: /Jennifer Martinez.*2 unread messages/ })).toBeInTheDocument()
    expect(within(list).getByText('You: How about Thursday?')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Select a conversation' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('should open the conversation in the URL, mark it read and tell the shell', async () => {
    const onRead = vi.fn()
    window.addEventListener('mavuus:messages-read', onRead)
    const fetchMock = renderPage('/dashboard/messages?conversation=2')
    const log = await screen.findByRole('list', { name: 'Messages with Jennifer Martinez' })
    expect(within(log).getByText('Have you met Priya?')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Jennifer Martinez' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Jennifer Martinez/ })).toHaveAttribute('aria-current', 'true')
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([u, init]) => u === '/api/messages/conversations/2/read' && init?.method === 'PUT')).toBe(true),
    )
    await waitFor(() => expect(onRead).toHaveBeenCalled())
    window.removeEventListener('mavuus:messages-read', onRead)
  })

  it('should announce a new message that a poll brings in and mark it read', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      let messages = tomMessages
      const fetchMock = renderPage('/dashboard/messages?conversation=1', {
        'GET /api/messages/conversations/1/messages': () => messages,
      })
      await screen.findByText('Hi! Loved your talk.')
      const reads = () => fetchMock.mock.calls.filter(([u, init]) => u === '/api/messages/conversations/1/read' && init?.method === 'PUT').length
      await waitFor(() => expect(reads()).toBe(1))
      messages = [...tomMessages, { id: 14, sender_id: 2, content: 'Thursday is great.', created_at: '2026-03-14T08:00:00Z' }]
      await vi.advanceTimersByTimeAsync(5000)
      expect(await screen.findByText('New message from Tom Bradley: Thursday is great.')).toHaveAttribute('role', 'status')
      await waitFor(() => expect(reads()).toBe(2))
      // A poll with nothing new marks nothing.
      await vi.advanceTimersByTimeAsync(5000)
      expect(reads()).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('should put the picked conversation in the URL', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('link', { name: /Tom Bradley/ }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?conversation=1'))
    expect(await screen.findByText('Hi! Loved your talk.')).toBeInTheDocument()
  })

  it('should send on Enter, add a line on Shift+Enter, clear the composer and keep focus there', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/messages?conversation=1', {
      'POST /api/messages/conversations/1/messages': reply(201, { id: 13 }),
    })
    const composer = await screen.findByRole('textbox', { name: 'Message Tom Bradley' })
    await user.type(composer, 'Thursday works{Shift>}{Enter}{/Shift}See you')
    expect(composer).toHaveValue('Thursday works\nSee you')
    expect(posts(fetchMock, '/api/messages/conversations/1/messages')).toHaveLength(0)
    await user.keyboard('{Enter}')
    await waitFor(() => expect(composer).toHaveValue(''))
    const [[, init]] = posts(fetchMock, '/api/messages/conversations/1/messages')
    expect(JSON.parse(init.body)).toEqual({ content: 'Thursday works\nSee you' })
    expect(composer).toHaveFocus()
    expect(screen.getByText('Message sent')).toBeInTheDocument()
  })

  it('should send once when Enter is pressed twice before the reply', async () => {
    const user = userEvent.setup()
    let finish
    const fetchMock = renderPage('/dashboard/messages?conversation=1', {
      'POST /api/messages/conversations/1/messages': () => new Promise((resolve) => (finish = resolve)).then(() => reply(201, { id: 13 })),
    })
    const composer = await screen.findByRole('textbox', { name: 'Message Tom Bradley' })
    await user.type(composer, 'Hello')
    await user.keyboard('{Enter}{Enter}')
    await user.click(screen.getByRole('button', { name: /Send message/ }))
    expect(posts(fetchMock, '/api/messages/conversations/1/messages')).toHaveLength(1)
    finish()
    await waitFor(() => expect(composer).toHaveValue(''))
  })

  it('should keep the text and show the error when sending fails', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage('/dashboard/messages?conversation=1', {
      'POST /api/messages/conversations/1/messages': reply(400, { error: 'Message text is required' }),
    })
    const composer = await screen.findByRole('textbox', { name: 'Message Tom Bradley' })
    await user.type(composer, 'Hello{Enter}')
    await waitFor(() => expect(error).toHaveBeenCalledWith('Message text is required', undefined))
    expect(composer).toHaveValue('Hello')
  })

  it('should ignore a slow thread that answers after another conversation was opened', async () => {
    const user = userEvent.setup()
    let finishTom
    renderPage('/dashboard/messages?conversation=1', {
      'GET /api/messages/conversations/1/messages': () => new Promise((resolve) => (finishTom = resolve)).then(() => tomMessages),
    })
    await user.click(await screen.findByRole('link', { name: /Jennifer Martinez/ }))
    expect(await screen.findByText('Have you met Priya?', { selector: 'p' })).toBeInTheDocument()
    finishTom()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.queryByText('Hi! Loved your talk.')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Messages with Jennifer Martinez' })).toBeInTheDocument()
  })

  it('should open the existing conversation for ?user=', async () => {
    renderPage('/dashboard/messages?user=3')
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?conversation=2'))
    expect(await screen.findByRole('list', { name: 'Messages with Jennifer Martinez' })).toBeInTheDocument()
  })

  it('should start a new conversation with a member there is no thread with yet', async () => {
    const user = userEvent.setup()
    let rows = conversations
    const fetchMock = renderPage('/dashboard/messages?user=9', {
      'GET /api/messages/conversations': () => rows,
      'GET /api/members/9': { id: 9, name: 'Priya Patel', title: 'CMO' },
      'POST /api/messages/conversations': () => {
        rows = [{ ...conversations[0], id: 5, other_user_id: 9, other_user_name: 'Priya Patel', other_user_title: 'CMO' }, ...conversations]
        return reply(201, { conversationId: 5 })
      },
      'GET /api/messages/conversations/5/messages': [{ id: 51, sender_id: 7, content: 'Hi Priya', created_at: '2026-03-15T07:00:00Z' }],
      'PUT /api/messages/conversations/5/read': { success: true },
    })
    expect(await screen.findByRole('heading', { name: 'Start the conversation' })).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Message Priya Patel' }), 'Hi Priya{Enter}')
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?conversation=5'))
    const [[, init]] = posts(fetchMock, '/api/messages/conversations')
    expect(JSON.parse(init.body)).toEqual({ userId: 9, message: 'Hi Priya' })
    expect(await screen.findByRole('list', { name: 'Messages with Priya Patel' })).toBeInTheDocument()
  })

  it('should say when the member to message is not found', async () => {
    renderPage('/dashboard/messages?user=99', { 'GET /api/members/99': reply(404, { error: 'Member not found' }) })
    expect(await screen.findByRole('heading', { name: 'Member not found' })).toBeInTheDocument()
  })

  it('should say when the conversation in the URL is not one of yours', async () => {
    renderPage('/dashboard/messages?conversation=77')
    expect(await screen.findByRole('heading', { name: 'Conversation not found' })).toBeInTheDocument()
  })

  it('should show the empty state when there are no conversations', async () => {
    renderPage('/dashboard/messages', { 'GET /api/messages/conversations': [] })
    expect(await screen.findByRole('heading', { name: 'No conversations yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse members' })).toHaveAttribute('href', '/dashboard/members')
  })

  it('should filter by name and say when nothing matches', async () => {
    const user = userEvent.setup()
    renderPage()
    const search = await screen.findByRole('searchbox', { name: 'Search conversations' })
    await user.type(search, 'jen')
    expect(screen.queryByRole('link', { name: /Tom Bradley/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Jennifer Martinez/ })).toBeInTheDocument()
    await user.type(search, 'zzz')
    expect(screen.getByRole('heading', { name: 'No matching conversations' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('link', { name: /Tom Bradley/ })).toBeInTheDocument()
  })

  it('should show an error with Try again when the conversations fail to load', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage('/dashboard/messages', {
      'GET /api/messages/conversations': () => (fail ? reply(500, {}) : conversations),
    })
    expect(await screen.findByText("We couldn't load your conversations")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: /Tom Bradley/ })).toBeInTheDocument()
  })
})
