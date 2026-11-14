import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { mockApi, reply } from '../test/mockApi'
import { useDetailResource } from './useDetailResource'

afterEach(() => vi.unstubAllGlobals())

describe('useDetailResource', () => {
  it('should load the item with the auth header', async () => {
    const fetchMock = mockApi({ 'GET /api/things/1': { id: 1, title: 'One' } })
    const { result } = renderHook(() => useDetailResource('/api/things/1', 'tok'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual({ id: 1, title: 'One' }))
    expect(result.current).toMatchObject({ loading: false, error: false, notFound: false })
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer tok' })
  })

  it('should drop the old item and load again when the url changes', async () => {
    mockApi({ 'GET /api/things/1': { id: 1 }, 'GET /api/things/2': { id: 2 } })
    const { result, rerender } = renderHook(({ url }) => useDetailResource(url, 'tok'), { initialProps: { url: '/api/things/1' } })
    await waitFor(() => expect(result.current.data).toEqual({ id: 1 }))
    rerender({ url: '/api/things/2' })
    expect(result.current).toMatchObject({ loading: true, data: null })
    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }))
  })

  it('should never show a slower answer for an old url', async () => {
    let finishOld
    mockApi({
      'GET /api/things/1': () => new Promise((resolve) => (finishOld = resolve)),
      'GET /api/things/2': { id: 2 },
    })
    const { result, rerender } = renderHook(({ url }) => useDetailResource(url, 'tok'), { initialProps: { url: '/api/things/1' } })
    rerender({ url: '/api/things/2' })
    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }))
    await act(async () => finishOld({ id: 1 }))
    expect(result.current.data).toEqual({ id: 2 })
  })

  it('should report a 404 as not found and other failures as an error that retry clears', async () => {
    let fail = true
    mockApi({ 'GET /api/things/9': reply(404), 'GET /api/things/3': () => (fail ? reply(500) : { id: 3 }) })
    const missing = renderHook(() => useDetailResource('/api/things/9', 'tok'))
    await waitFor(() => expect(missing.result.current.notFound).toBe(true))
    expect(missing.result.current.error).toBe(false)

    const broken = renderHook(() => useDetailResource('/api/things/3', 'tok'))
    await waitFor(() => expect(broken.result.current.error).toBe(true))
    fail = false
    act(() => broken.result.current.retry())
    expect(broken.result.current.loading).toBe(true)
    await waitFor(() => expect(broken.result.current.data).toEqual({ id: 3 }))
    expect(broken.result.current.error).toBe(false)
  })

  it('should report a network failure as an error', async () => {
    mockApi({ 'GET /api/things/1': () => new TypeError('Failed to fetch') })
    const { result } = renderHook(() => useDetailResource('/api/things/1', 'tok'))
    await waitFor(() => expect(result.current.error).toBe(true))
  })
})
