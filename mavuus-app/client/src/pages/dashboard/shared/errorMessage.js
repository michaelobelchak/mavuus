/** The server's `error` text from a refused response, or `fallback` when it sent none. */
export async function errorMessage(res, fallback) {
  const body = await res.json().catch(() => null)
  return typeof body?.error === 'string' && body.error ? body.error : fallback
}
