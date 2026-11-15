import { useEffect } from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import { mockApi, reply } from '../test/mockApi'
import { AuthProvider, useAuth } from './AuthContext'

const captured = { current: null }
function Capture() {
  const value = useAuth()
  useEffect(() => {
    captured.current = value
  })
  return null
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

async function renderProvider() {
  const fetchMock = mockApi({
    'GET /api/auth/me': reply(401, {}),
    'POST /api/auth/register': reply(201, { token: 't', user: { id: 9, name: 'Rita' } }),
  })
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>,
  )
  await waitFor(() => expect(captured.current?.loading).toBe(false))
  return fetchMock
}

describe('AuthProvider register', () => {
  it('should send the referral code with the sign-up when there is one', async () => {
    const fetchMock = await renderProvider()
    await act(() => captured.current.register('Rita', 'rita@test.com', 'Password9', { ref: 'MAVUUS 2026' }))
    const call = fetchMock.mock.calls.find(([url]) => url.startsWith('/api/auth/register'))
    expect(call[0]).toBe('/api/auth/register?ref=MAVUUS%202026')
  })

  it('should sign up without a query string when there is no referral code', async () => {
    const fetchMock = await renderProvider()
    await act(() => captured.current.register('Rita', 'rita@test.com', 'Password9'))
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/auth/register')).toBe(true)
  })
})
