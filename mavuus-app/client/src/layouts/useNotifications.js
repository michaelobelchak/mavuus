import { useCallback, useEffect, useState } from 'react'

export const POLL_MS = 30_000

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

/**
 * A count from `url` (`{ count }`), fetched on mount, every 30 seconds and whenever `refreshKey`
 * changes. Returns `[count, setCount, pulse]`: `pulse` is true when the count last went up from a
 * count above zero, so the first load never pulses.
 */
export function usePolledCount(url, token, refreshKey) {
  const [state, setState] = useState({ count: 0, pulse: false })

  useEffect(() => {
    if (!token) return undefined
    let active = true
    const load = async () => {
      try {
        const response = await fetch(url, { headers: authHeaders(token) })
        if (!response.ok || !active) return
        const { count } = await response.json()
        if (!active) return
        setState((previous) => ({ count: Number(count) || 0, pulse: previous.count > 0 }))
      } catch {
        // A missed poll keeps the last count; the next one tries again.
      }
    }
    load()
    const timer = setInterval(load, POLL_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [url, token, refreshKey])

  const setCount = useCallback((update) => {
    setState((previous) => ({
      count: typeof update === 'function' ? update(previous.count) : update,
      pulse: false,
    }))
  }, [])

  return [state.count, setCount, state.pulse]
}

/**
 * The bell's data: the unread count (polled), the list (fetched each time `open` turns true) and
 * the mark-read actions, which update the list and count right away.
 */
export function useNotifications(token, open) {
  const [count, setCount, pulse] = usePolledCount('/api/notifications/unread-count', token)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', { headers: authHeaders(token) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setItems(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const markRead = useCallback(
    async (id) => {
      try {
        const response = await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: authHeaders(token) })
        if (!response.ok) return
        setItems((previous) => previous.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)))
        setCount((previous) => Math.max(0, previous - 1))
      } catch {
        // Stays unread; the next poll shows the real count.
      }
    },
    [token, setCount],
  )

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'PUT', headers: authHeaders(token) })
      if (!response.ok) return
      setItems((previous) => previous.map((item) => ({ ...item, is_read: 1 })))
      setCount(0)
    } catch {
      // Stays unread; the next poll shows the real count.
    }
  }, [token, setCount])

  return { count, pulse, items, loading, error, reload: load, markRead, markAllRead }
}
