// Field options and checks for the profile page. The limits match PUT /api/profile/me.

export const INDUSTRY_OPTIONS = [
  'Technology', 'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
  'Marketing Technology', 'Cloud Computing', 'Entertainment', 'Media',
  'Professional Services', 'Design & Tech', 'Productivity Software', 'Communications',
]

export const SKILL_SUGGESTIONS = [
  'Content Strategy', 'SEO', 'B2B Marketing', 'Revenue Marketing', 'ABM',
  'Demand Generation', 'Marketing Analytics', 'Brand Strategy', 'Growth Marketing',
  'Product Marketing', 'Digital Marketing', 'Social Media', 'Paid Media',
  'Marketing Automation', 'Content Marketing', 'E-commerce', 'DTC Marketing',
  'Performance Marketing', 'Creative Direction', 'Public Speaking', 'Leadership',
  'A/B Testing', 'Conversion Optimization', 'Product-Led Growth', 'Community Building',
]

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public: every member can see your full profile' },
  { value: 'connections', label: 'Connections only: others see your name, title and company' },
  { value: 'private', label: 'Private: hidden from the member directory' },
]

export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const RESUME_MAX_BYTES = 5 * 1024 * 1024

const HTTP_URL = /^https?:\/\/\S+$/i

/** An error message when `value` is longer than `max`, else ''. */
export const tooLong = (value, max) => (value && value.length > max ? `Keep it to ${max} characters or fewer.` : '')

/** An error message for a link that isn't empty and doesn't start with http:// or https://. */
export const badLink = (value) => (value && !HTTP_URL.test(value.trim()) ? 'Enter a full link that starts with https://' : '')

/** An error for years of experience that aren't empty or a whole number from 0 to 70. */
export function badYears(value) {
  if (value === '' || value === null || value === undefined) return ''
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 && number <= 70 ? '' : 'Enter a whole number from 0 to 70.'
}

/** The server's password rules: 8+ characters, an uppercase letter and a number. */
export function passwordProblem(value) {
  if (value.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter.'
  if (!/[0-9]/.test(value)) return 'Add at least one number.'
  return ''
}

/** The keys whose values differ between two flat objects (compared as trimmed text). */
export function changedKeys(saved, draft) {
  const text = (value) => (value === null || value === undefined ? '' : String(value).trim())
  return Object.keys(draft).filter((key) => text(saved[key]) !== text(draft[key]))
}

/** "Mar 2024" for a stored "2024-03" month, or the value as it is. */
export function monthLabel(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || '')
  if (!match) return value || ''
  return new Date(Number(match[1]), Number(match[2]) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
