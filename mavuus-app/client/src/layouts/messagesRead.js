import { useEffect, useState } from 'react'

const MESSAGES_READ = 'mavuus:messages-read'

/**
 * Tells the member shell that messages were just marked read, so the Messages badge refreshes now
 * instead of on the next 30-second poll or navigation (opening a thread only changes the query).
 */
export function announceMessagesRead() {
  window.dispatchEvent(new Event(MESSAGES_READ))
}

/** A number that goes up each time a page announces messages read; use it as a refresh key. */
export function useMessagesReadKey() {
  const [key, setKey] = useState(0)
  useEffect(() => {
    const bump = () => setKey((value) => value + 1)
    window.addEventListener(MESSAGES_READ, bump)
    return () => window.removeEventListener(MESSAGES_READ, bump)
  }, [])
  return key
}
