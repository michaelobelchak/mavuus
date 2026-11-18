import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POLL_MS, useNotifications, usePolledCount } from './useNotifications'

const URL = '/api/notifications/unread-count'

function json(body, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

// A fetch whose response the test releases by hand.
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

let visibility = 'visible'
beforeEach(() => {
  visibility = 'visible'
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete document.visibilityState
})

describe('usePolledCount', () => {
  it('should fetch on mount, again every 30 seconds and never after unmount', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => json({ count: 2 }))
    vi.stubGlobal('fetch', fetchMock)
    const { result, unmount } = renderHook(() => usePolledCount(URL, 'token-1'))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current[0]).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer token-1' })
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    unmount()
    await vi.advanceTimersByTimeAsync(POLL_MS * 3)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('should fetch again when the refresh key changes (a navigation)', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => json({ count: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    const { rerender } = renderHook(({ path }) => usePolledCount(URL, 't', { refreshKey: path }), {
      initialProps: { path: '/dashboard' },
    })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    rerender({ path: '/dashboard/messages' })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('should stop polling and report once when the session is gone (401)', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => json({ error: 'Unauthorized' }, 401))
    vi.stubGlobal('fetch', fetchMock)
    const onUnauthorized = vi.fn()
    renderHook(() => usePolledCount(URL, 't', { onUnauthorized }))
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS * 3))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('should skip polls while the tab is hidden and fetch as soon as it is visible again', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => json({ count: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    renderHook(() => usePolledCount(URL, 't'))
    await act(() => vi.advanceTimersByTimeAsync(0))
    visibility = 'hidden'
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS * 2))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    visibility = 'visible'
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('should pulse only when the count rises from above zero and not re-render for an unchanged count', async () => {
    vi.useFakeTimers()
    const counts = [3, 5, 5]
    vi.stubGlobal('fetch', vi.fn(async () => json({ count: counts.shift() ?? 5 })))
    let renders = 0
    const { result } = renderHook(() => {
      renders += 1
      return usePolledCount(URL, 't')
    })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current[0]).toBe(3)
    expect(result.current[2]).toBe(false)
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS))
    expect(result.current[0]).toBe(5)
    expect(result.current[2]).toBe(true)
    // React may render once more to find the state unchanged; after that, polls with the same
    // count render nothing.
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS))
    const settled = renders
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS * 3))
    expect(renders).toBe(settled)
    expect(result.current[2]).toBe(true)
  })

  it('should not let a poll that started before a local change undo it', async () => {
    const pending = deferred()
    vi.stubGlobal('fetch', vi.fn(() => pending.promise))
    const { result } = renderHook(() => usePolledCount(URL, 't'))
    act(() => result.current[1](0))
    await act(async () => pending.resolve(json({ count: 7 })))
    expect(result.current[0]).toBe(0)
  })
})

describe('useNotifications', () => {
  it('should keep the list read when a stale load finishes after Mark all read', async () => {
    const unread = [{ id: 1, title: 'A', is_read: 0 }, { id: 2, title: 'B', is_read: 0 }]
    const read = unread.map((item) => ({ ...item, is_read: 1 }))
    const firstLoad = deferred()
    let listCalls = 0
    const fetchMock = vi.fn(async (url, init = {}) => {
      if (url === URL) return json({ count: 2 })
      if (url === '/api/notifications' && !init.method) {
        listCalls += 1
        // The first load ignores the abort and answers late with the old, unread list.
        return listCalls === 1 ? firstLoad.promise : json(read)
      }
      return json({ success: true })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useNotifications('t', true))
    await waitFor(() => expect(result.current.count).toBe(2))
    expect(result.current.loading).toBe(true)
    await act(() => result.current.markAllRead())
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/read-all', expect.objectContaining({ method: 'PUT' }))
    await waitFor(() => expect(result.current.items).toEqual(read))
    await act(async () => firstLoad.resolve(json(unread)))
    expect(result.current.items).toEqual(read)
    expect(result.current.count).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  it('should abort the in-flight load when a mark action starts', async () => {
    const signals = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, init = {}) => {
        if (url === URL) return json({ count: 1 })
        if (url === '/api/notifications' && !init.method) {
          signals.push(init.signal)
          return new Promise(() => {})
        }
        return json({ success: true })
      }),
    )
    const { result } = renderHook(() => useNotifications('t', true))
    await waitFor(() => expect(signals).toHaveLength(1))
    await act(() => result.current.markRead(1))
    expect(signals[0].aborted).toBe(true)
  })

  it('should report a 401 from the list as a lost session', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => (url === URL ? json({ count: 0 }) : json({}, 401))))
    const onUnauthorized = vi.fn()
    renderHook(() => useNotifications('t', true, { onUnauthorized }))
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled())
  })
})
