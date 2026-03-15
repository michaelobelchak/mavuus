import { useState, useEffect } from 'react'

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem('mavuus_token')
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        setData(json)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}
