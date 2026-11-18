import { useCallback, useEffect, useState } from 'react'

/**
 * Loads one item for a detail page: `{ data, loading, error, notFound, retry }`.
 * - A new `url` (another :id) drops the old item at once (`loading`, `data` null) and loads the
 *   new one; an answer for an old url or attempt is ignored and its request aborted.
 * - A 404 sets `notFound`; any other failure (network, server) sets `error`, and `retry()` loads
 *   again.
 * - `token` goes in the Authorization header.
 */
export function useDetailResource(url, token) {
  const [attempt, setAttempt] = useState(0)
  const key = `${url}#${attempt}`
  const [result, setResult] = useState({ key: null, data: null, error: false, notFound: false })

  useEffect(() => {
    const controller = new AbortController()
    const settle = (next) => {
      if (!controller.signal.aborted) setResult({ key, data: null, error: false, notFound: false, ...next })
    }
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (res) => {
        if (res.ok) settle({ data: await res.json() })
        else if (res.status === 404) settle({ notFound: true })
        else settle({ error: true })
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') settle({ error: true })
      })
    return () => controller.abort()
  }, [url, token, key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const current = result.key === key
  return {
    data: current ? result.data : null,
    loading: !current,
    error: current && result.error,
    notFound: current && result.notFound,
    retry,
  }
}
