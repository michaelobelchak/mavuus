import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { mockApi } from '../../../test/mockApi'
import { useSavedJobs } from './useSavedJobs'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useSavedJobs', () => {
  it('should keep a toggle made before the saved list arrives', async () => {
    const fetchMock = mockApi({ 'GET /api/jobs/saved': [{ id: 5 }], 'POST /api/jobs/3/save': { success: true } })
    let release
    const gate = new Promise((resolve) => {
      release = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn((url, init) => (url === '/api/jobs/saved' ? gate.then(() => fetchMock(url, init)) : fetchMock(url, init))),
    )
    const { result } = renderHook(() => useSavedJobs('t'))
    await act(() => result.current.setSaved(3, true))
    expect(result.current.savedIds.has(3)).toBe(true)
    await act(async () => {
      release()
    })
    await waitFor(() => expect(result.current.savedIds.has(5)).toBe(true))
    expect(result.current.savedIds.has(3)).toBe(true)
  })
})
