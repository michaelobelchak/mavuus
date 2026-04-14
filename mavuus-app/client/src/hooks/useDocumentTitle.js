import { useEffect } from 'react'

const SUFFIX = 'Mavuus'

/**
 * Sets document.title while the component is mounted.
 * Restores the previous title on unmount.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX
    return () => {
      document.title = prev
    }
  }, [title])
}
