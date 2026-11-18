import { formatDate, parseDate } from '@/design-system/lib/formatDate'

/** Job types as the API stores them, with the label people see. */
export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
]

/** Seniority levels the API accepts. */
export const JOB_SENIORITIES = ['Junior', 'Mid', 'Senior', 'Lead'].map((level) => ({ value: level, label: level }))

/** Job statuses a poster can pick, in order. */
export const JOB_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
]

/** "Full-time" for "full-time"; an unknown type is shown as it is. */
export function jobTypeLabel(type) {
  if (!type) return ''
  return JOB_TYPES.find((option) => option.value === type)?.label ?? type
}

/** The first paragraph of a job description as plain text (no ** headings). */
export function jobExcerpt(description) {
  if (!description) return ''
  return description.split('\n\n')[0].replace(/\*\*/g, '').trim()
}

/** "Today", "Yesterday", "3d ago", "2w ago", then a short date ("Mar 7"). */
export function postedLabel(value, now = new Date()) {
  const date = parseDate(value)
  if (!date) return ''
  const days = Math.floor((now - date) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(date, { month: 'short', day: 'numeric' })
}

/** JobCard props shared by every list of jobs (search results, saved jobs, postings). */
export function jobCardProps(job) {
  return {
    title: job.title,
    company: job.company,
    description: jobExcerpt(job.description),
    location: job.location,
    type: jobTypeLabel(job.type),
    salary: job.salary_range,
    category: job.category,
    seniority: job.seniority,
  }
}
