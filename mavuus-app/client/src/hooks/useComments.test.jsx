import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { mockApi, reply } from '../test/mockApi'
import { useComments } from './useComments'

vi.mock('../context/AuthContext', async () => {
  const { demoAuth } = await import('../test/mockApi')
  return { useAuth: () => demoAuth }
})

const rows = [
  {
    id: 1,
    user_id: 3,
    user_name: 'Priya Patel',
    user_avatar: '/a.webp',
    content: 'Will there be a recording?',
    created_at: '2026-03-11 10:00:00',
    replies: [{ id: 2, user_id: 7, user_name: 'Demo User', content: 'Yes.', created_at: '2026-03-11 11:00:00' }],
  },
]

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function loaded(routes = {}) {
  const fetchMock = mockApi({ 'GET /api/comments': rows, ...routes })
  const hook = renderHook(() => useComments('session', 1))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return { ...hook, fetchMock }
}

describe('useComments', () => {
  it('should load the comments for the item and map them to CommentThread props', async () => {
    const { result, fetchMock } = await loaded()
    expect(fetchMock).toHaveBeenCalledWith('/api/comments?entity_type=session&entity_id=1')
    const [first] = result.current.comments
    expect(first).toMatchObject({ id: 1, authorName: 'Priya Patel', authorAvatarSrc: '/a.webp', own: false, timeLabel: 'Mar 11' })
    expect(first.dateTime).toBe('2026-03-11T10:00:00.000Z')
    expect(first.replies[0]).toMatchObject({ id: 2, own: true })
    expect(result.current.currentUser).toEqual({ name: 'Demo User', avatarSrc: '/images/avatars/avatar-06.webp' })
  })

  it('should be loading until the first answer arrives', () => {
    mockApi({ 'GET /api/comments': rows })
    const { result } = renderHook(() => useComments('session', 1))
    expect(result.current.loading).toBe(true)
  })

  it('should post a comment and put it first', async () => {
    const created = { id: 9, user_id: 7, user_name: 'Demo User', content: 'Great talk', created_at: '2026-03-12 09:00:00' }
    const { result, fetchMock } = await loaded({ 'POST /api/comments': created })
    let ok
    await act(async () => {
      ok = await result.current.onPost('Great talk')
    })
    expect(ok).toBe(true)
    const [url, init] = fetchMock.mock.calls.at(-1)
    expect(url).toBe('/api/comments')
    expect(JSON.parse(init.body)).toEqual({ entity_type: 'session', entity_id: 1, content: 'Great talk' })
    expect(init.headers.Authorization).toBe('Bearer test-token')
    expect(result.current.comments.map((c) => c.id)).toEqual([9, 1])
    expect(result.current.comments[0]).toMatchObject({ own: true, replies: [] })
  })

  it("should keep the text and toast the server's error when the post is refused", async () => {
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const { result } = await loaded({ 'POST /api/comments': reply(400, { error: 'Comment is too long' }) })
    let ok
    await act(async () => {
      ok = await result.current.onPost('x')
    })
    expect(ok).toBe(false)
    expect(result.current.comments).toHaveLength(1)
    expect(error).toHaveBeenCalledWith('Comment is too long', undefined)
  })

  it('should toast a fallback when a refused reply or delete has no error text', async () => {
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const { result } = await loaded({ 'POST /api/comments': reply(500), 'DELETE /api/comments/2': reply(403, { error: 'Not your comment' }) })
    await act(async () => {
      expect(await result.current.onReply(1, 'Hi')).toBe(false)
      await result.current.onDelete(2)
    })
    expect(error.mock.calls.map(([message]) => message)).toEqual(["Couldn't post your reply. Try again.", 'Not your comment'])
    expect(result.current.comments[0].replies).toHaveLength(1)
  })

  it('should clear the old comments while another item loads', async () => {
    let answer
    mockApi({
      'GET /api/comments': (url) => (url.includes('entity_id=1') ? rows : new Promise((resolve) => (answer = resolve))),
    })
    const { result, rerender } = renderHook(({ id }) => useComments('session', id), { initialProps: { id: 1 } })
    await waitFor(() => expect(result.current.comments).toHaveLength(1))
    rerender({ id: 2 })
    expect(result.current).toMatchObject({ loading: true, comments: [] })
    await act(async () => answer([]))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.comments).toEqual([])
  })

  it('should add a reply under its parent with the parent id', async () => {
    const reply = { id: 10, user_id: 7, user_name: 'Demo User', content: 'Thanks', created_at: '2026-03-12 09:00:00' }
    const { result, fetchMock } = await loaded({ 'POST /api/comments': reply })
    await act(async () => {
      await result.current.onReply(1, 'Thanks')
    })
    expect(JSON.parse(fetchMock.mock.calls.at(-1)[1].body)).toMatchObject({ parent_id: 1, content: 'Thanks' })
    expect(result.current.comments[0].replies.map((r) => r.id)).toEqual([2, 10])
  })

  it('should remove a deleted comment or reply', async () => {
    const { result, fetchMock } = await loaded({ 'DELETE /api/comments/2': {} })
    await act(async () => {
      await result.current.onDelete(2)
    })
    expect(fetchMock.mock.calls.at(-1)[1].method).toBe('DELETE')
    expect(result.current.comments[0].replies).toEqual([])
  })

  it('should toast an error when posting, replying or deleting fails on the network', async () => {
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const offline = () => new TypeError('Failed to fetch')
    const { result } = await loaded({ 'POST /api/comments': offline, 'DELETE /api/comments/1': offline })
    await act(async () => {
      expect(await result.current.onPost('Hi')).toBe(false)
      expect(await result.current.onReply(1, 'Hi')).toBe(false)
      await result.current.onDelete(1)
    })
    expect(error.mock.calls.map(([message]) => message)).toEqual([
      "Couldn't post your comment. Try again.",
      "Couldn't post your reply. Try again.",
      "Couldn't delete the comment. Try again.",
    ])
    expect(result.current.comments).toHaveLength(1)
  })
})
