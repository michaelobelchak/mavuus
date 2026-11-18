import { useCallback, useEffect, useRef, useState } from 'react'

export const POLL_MS = 30_000

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

// Keeps the latest callback in a ref, so effects don't restart when a parent passes a new one.
function useLatest(value) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}

/**
 * A count from `url` (`{ count }`), fetched on mount, every 30 seconds and whenever `refreshKey`
 * changes. Returns `[count, setCount, pulse]`.
 * - `pulse` is true when the count last rose from a count above zero, so the first load never pulses.
 * - Polls are skipped while the tab is hidden; the count is fetched again when it comes back.
 * - A 401 stops polling and calls `onUnauthorized` once (the session is gone).
 * - `setCount` is for local changes (mark read): a poll that started before it is dropped, so a
 *   slow response can't bring back the old count.
 */
export function usePolledCount(url, token, { refreshKey, onUnauthorized } = {}) {
  const [state, setState] = useState({ count: 0, pulse: false })
  const versionRef = useRef(0)
  const onUnauthorizedRef = useLatest(onUnauthorized)

  useEffect(() => {
    if (!token) return undefined
    let active = true
    const controller = new AbortController()
    const load = async () => {
      if (!active || document.visibilityState === 'hidden') return
      const version = versionRef.current
      try {
        const response = await fetch(url, { headers: authHeaders(token), signal: controller.signal })
        if (!active) return
        if (response.status === 401) {
          stop()
          onUnauthorizedRef.current?.()
          return
        }
        if (!response.ok) return
        const { count } = await response.json()
        if (!active || version !== versionRef.current) return
        const next = Number(count) || 0
        setState((previous) =>
          previous.count === next ? previous : { count: next, pulse: next > previous.count && previous.count > 0 },
        )
      } catch {
        // A missed poll keeps the last count; the next one tries again.
      }
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') load()
    }
    const timer = setInterval(load, POLL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    function stop() {
      active = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    load()
    return () => {
      stop()
      controller.abort()
    }
  }, [url, token, refreshKey, onUnauthorizedRef])

  const setCount = useCallback((update) => {
    versionRef.current += 1
    setState((previous) => {
      const next = typeof update === 'function' ? update(previous.count) : update
      return next === previous.count && !previous.pulse ? previous : { count: next, pulse: false }
    })
  }, [])

  return [state.count, setCount, state.pulse]
}

/**
 * The bell's data: the unread count (polled), the list (fetched each time `open` turns true) and
 * the mark-read actions, which update the list and count right away.
 * - A load is aborted when a newer one starts or a mark action starts; a mark action that cut a
 *   load short loads the list again afterwards, and a stale response is always ignored.
 * - `onUnauthorized` runs on a 401 from the count or the list.
 */
export function useNotifications(token, open, { onUnauthorized } = {}) {
  const [count, setCount, pulse] = usePolledCount('/api/notifications/unread-count', token, { onUnauthorized })
  const onUnauthorizedRef = useLatest(onUnauthorized)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const loadSeqRef = useRef(0)
  const loadControllerRef = useRef(null)

  const load = useCallback(async () => {
    if (!token) return
    loadControllerRef.current?.abort()
    const controller = new AbortController()
    loadControllerRef.current = controller
    const seq = ++loadSeqRef.current
    const current = () => seq === loadSeqRef.current
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', { headers: authHeaders(token), signal: controller.signal })
      if (!current()) return
      if (response.status === 401) {
        onUnauthorizedRef.current?.()
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (current()) setItems(data)
    } catch (err) {
      if (current() && err.name !== 'AbortError') setError(err.message)
    } finally {
      if (current()) {
        setLoading(false)
        loadControllerRef.current = null
      }
    }
  }, [token, onUnauthorizedRef])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => () => loadControllerRef.current?.abort(), [])

  // Stops a load in flight (its answer would predate the change). True when one was stopped.
  const interruptLoad = useCallback(() => {
    if (!loadControllerRef.current) return false
    loadControllerRef.current.abort()
    loadControllerRef.current = null
    loadSeqRef.current += 1
    setLoading(false)
    return true
  }, [])

  const mark = useCallback(
    async (url, applyLocally) => {
      const interrupted = interruptLoad()
      try {
        const response = await fetch(url, { method: 'PUT', headers: authHeaders(token) })
        if (response.ok) applyLocally()
      } catch {
        // Stays unread; the next poll shows the real count.
      }
      if (interrupted) load()
    },
    [token, interruptLoad, load],
  )

  const markRead = useCallback(
    (id) =>
      mark(`/api/notifications/${id}/read`, () => {
        setItems((previous) => previous.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)))
        setCount((previous) => Math.max(0, previous - 1))
      }),
    [mark, setCount],
  )

  const markAllRead = useCallback(
    () =>
      mark('/api/notifications/read-all', () => {
        setItems((previous) => previous.map((item) => ({ ...item, is_read: 1 })))
        setCount(0)
      }),
    [mark, setCount],
  )

  return { count, pulse, items, loading, error, reload: load, markRead, markAllRead }
}
