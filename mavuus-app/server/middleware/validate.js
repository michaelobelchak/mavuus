const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/.+/

export function validateEmail(email) {
  return EMAIL_REGEX.test(email)
}

export function validateUrl(url) {
  if (!url) return true // optional
  return URL_REGEX.test(url)
}

export function validateLength(str, max) {
  if (!str) return true
  return str.length <= max
}

export const MAX_LENGTHS = {
  title: 200,
  description: 5000,
  bio: 2000,
  message: 10000,
  name: 200,
  company: 200,
  email: 254,
}
