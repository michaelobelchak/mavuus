/**
 * Sanitize string values in request body to prevent XSS.
 * Strips HTML tags from all string fields.
 */
function stripTags(str) {
  return str.replace(/<[^>]*>/g, '')
}

function sanitizeValue(val) {
  if (typeof val === 'string') return stripTags(val).trim()
  if (Array.isArray(val)) return val.map(sanitizeValue)
  if (val && typeof val === 'object') return sanitizeObject(val)
  return val
}

function sanitizeObject(obj) {
  const clean = {}
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = sanitizeValue(val)
  }
  return clean
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  next()
}
