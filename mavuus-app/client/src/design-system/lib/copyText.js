/**
 * Copies `text` and resolves true when it worked. The Clipboard API first; without it (or when the
 * browser refuses) it selects `fallbackInput`, a read-only field that shows the same text, and uses
 * execCommand('copy'). Only claim success to the user when this resolves true.
 */
export async function copyText(text, fallbackInput) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Refused (no permission, not focused): try the selection below.
    }
  }
  if (!fallbackInput) return false
  fallbackInput.focus()
  fallbackInput.select()
  try {
    return document.execCommand?.('copy') === true
  } catch {
    return false
  }
}
