const RESUME_ROUTE = '/api/files/resumes/'
const STORED = /^\/(?:api\/files|uploads)\/resumes\/([A-Za-z0-9][A-Za-z0-9._-]*)$/

/**
 * The link for a stored resume url ('/api/files/resumes/<name>', or the older
 * '/uploads/resumes/<name>'), or null for anything else. Resumes are private: the server checks
 * who asks through the session cookie, so a plain link works and no token goes in the URL.
 */
export function resumeHref(url) {
  const match = typeof url === 'string' ? STORED.exec(url) : null
  return match && !match[1].includes('..') ? `${RESUME_ROUTE}${match[1]}` : null
}
