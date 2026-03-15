import { useState, useEffect } from 'react'

/**
 * Fetches data from the API, falls back to provided default data if the API is unreachable.
 * This is useful for demo mode where the server may not be running.
 */
export default function useApiData(url, fallbackData = null) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFromApi, setIsFromApi] = useState(false)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchData() {
      try {
        const token = localStorage.getItem('mavuus_token')
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        setData(json)
        setIsFromApi(true)
      } catch (err) {
        if (err.name !== 'AbortError') {
          // API failed — keep fallback data
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [url])

  return { data, loading, error, isFromApi }
}
