import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, FileText, Plus } from 'lucide-react'
import { Alert, Dialog, DialogClose, EmptyState, FormField, Tabs, useToast } from '@/design-system/patterns'
import { JobCard, JobCardSkeleton, StatusBadge } from '@/design-system/organisms'
import { Badge, Button, Input, Select, Text, Textarea } from '@/design-system/primitives'
import { formatDate } from '@/design-system/lib/formatDate'
import { useAuth } from '../../context/AuthContext'
import { JOB_SENIORITIES, JOB_TYPES, jobCardProps, jobTypeLabel } from './shared/jobs'
import { JOBS_PATH } from './shared/paths'
import { errorMessage } from './shared/errorMessage'
import { listOf } from './shared/reviewProps'

const TABS = ['applications', 'saved', 'postings']
// Each tab loads its own list, so one failing endpoint doesn't take down the other tabs.
const ENDPOINTS = {
  applications: '/api/jobs/my-applications',
  saved: '/api/jobs/saved',
  postings: '/api/jobs/my-postings',
}
const LOADING = { status: 'loading', rows: [] }
const LIST = 'flex flex-col gap-ds-md'
const emptyForm = (company) => ({
  title: '',
  company: company || '',
  description: '',
  location: '',
  type: 'full-time',
  category: '',
  salary_range: '',
  seniority: null,
})

function JobList({ label, children }) {
  return (
    <ul aria-label={label} className={LIST}>
      {children}
    </ul>
  )
}

export default function MyJobsPage() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TABS.includes(requested) ? requested : 'applications'
  const [lists, setLists] = useState({ applications: LOADING, saved: LOADING, postings: LOADING })
  const removing = useRef(new Set())
  const [postOpen, setPostOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  // The guard is a ref, so two clicks in the same frame can't both post.
  const postingRef = useRef(false)
  const [form, setForm] = useState(() => emptyForm(user?.company))

  const setList = (name, next) => setLists((prev) => ({ ...prev, [name]: next }))
  const loadList = useCallback(
    async (name, signal) => {
      try {
        const res = await fetch(ENDPOINTS[name], { headers: { Authorization: `Bearer ${token}` }, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows = listOf(await res.json())
        if (!signal?.aborted) setLists((prev) => ({ ...prev, [name]: { status: 'ready', rows } }))
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return
        setLists((prev) => ({ ...prev, [name]: { status: 'error', rows: [] } }))
      }
    },
    [token],
  )

  useEffect(() => {
    const controller = new AbortController()
    for (const name of TABS) loadList(name, controller.signal)
    return () => controller.abort()
  }, [loadList])

  const retry = (name) => {
    setList(name, LOADING)
    loadList(name)
  }

  const changeTab = (next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next === 'applications') params.delete('tab')
      else params.set('tab', next)
      return params
    })
  }

  const unsave = async (job) => {
    if (removing.current.has(job.id)) return
    removing.current.add(job.id)
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setLists((prev) => ({ ...prev, saved: { ...prev.saved, rows: prev.saved.rows.filter((row) => row.id !== job.id) } }))
      toast.success('Job removed from saved')
    } catch {
      toast.error("Couldn't remove the job. Try again.")
    } finally {
      removing.current.delete(job.id)
    }
  }

  const postJob = async () => {
    if (postingRef.current) return
    if (!form.title.trim() || !form.company.trim()) {
      toast.error('Title and company are required')
      return
    }
    postingRef.current = true
    setPosting(true)
    try {
      const { seniority, ...fields } = form
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(seniority ? { ...fields, seniority } : fields),
      })
      if (!res.ok) {
        toast.error(await errorMessage(res, 'Failed to post job'))
        return
      }
      toast.success('Job posted!')
      setPostOpen(false)
      setForm(emptyForm(user?.company))
      await loadList('postings')
      changeTab('postings')
    } catch {
      toast.error('Failed to post job')
    } finally {
      postingRef.current = false
      setPosting(false)
    }
  }
  // Every new form starts from the profile's company, whatever the last one held.
  const openPost = () => {
    setForm(emptyForm(user?.company))
    setPostOpen(true)
  }

  const field = (key) => ({
    value: form[key],
    onChange: (event) => setForm((prev) => ({ ...prev, [key]: event.target.value })),
  })
  const browse = (
    <Button size="sm" to={JOBS_PATH}>
      Browse Jobs
    </Button>
  )
  const postButton = (size) => (
    <Button size={size} leadingIcon={Plus} onClick={openPost}>
      Post a Job
    </Button>
  )

  const ERROR_TITLES = {
    applications: "We couldn't load your applications",
    saved: "We couldn't load your saved jobs",
    postings: "We couldn't load your postings",
  }
  // A tab's body: skeletons, its own error with Try again, the empty state or the list.
  const body = (name, empty, list) => {
    const { status, rows } = lists[name]
    if (status === 'loading') {
      return (
        <ul aria-busy="true" aria-label={`Loading ${name}`} className={LIST}>
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <JobCardSkeleton announce={false} />
            </li>
          ))}
        </ul>
      )
    }
    if (status === 'error') {
      return (
        <Alert
          tone="error"
          title={ERROR_TITLES[name]}
          description="Check your connection and try again."
          actions={
            <Button size="sm" variant="outline" onClick={() => retry(name)}>
              Try again
            </Button>
          }
        />
      )
    }
    return rows.length === 0 ? empty : list(rows)
  }
  const label = (name, text) => (lists[name].status === 'ready' ? `${text} (${lists[name].rows.length})` : text)

  const items = [
    {
      value: 'applications',
      label: label('applications', 'Applications'),
      content: body(
        'applications',
        <EmptyState
          headingLevel={2}
          icon={FileText}
          title="No applications yet"
          description="Browse jobs and apply to get started."
          actions={browse}
        />,
        (rows) => (
          <JobList label="My applications">
            {rows.map((app) => (
              <li key={app.id}>
                <JobCard
                  headingLevel={2}
                  title={app.job_title}
                  company={app.job_company}
                  location={app.job_location}
                  type={jobTypeLabel(app.job_type)}
                  status={
                    <>
                      <StatusBadge status={app.status} size="sm" />
                      {app.unavailable && <Badge size="sm">No longer available</Badge>}
                    </>
                  }
                  postedLabel={`Applied ${formatDate(app.applied_at)}`}
                  // A job an admin hid or removed would only open "Job not found".
                  to={app.unavailable ? undefined : `${JOBS_PATH}/${app.job_id}`}
                />
              </li>
            ))}
          </JobList>
        ),
      ),
    },
    {
      value: 'saved',
      label: label('saved', 'Saved'),
      content: body(
        'saved',
        <EmptyState
          headingLevel={2}
          icon={Bookmark}
          title="No saved jobs"
          description="Bookmark jobs you're interested in to find them here."
          actions={browse}
        />,
        (rows) => (
          <JobList label="Saved jobs">
            {rows.map((job) => (
              <li key={job.id}>
                <JobCard
                  headingLevel={2}
                  {...jobCardProps(job)}
                  description={undefined}
                  to={`${JOBS_PATH}/${job.id}`}
                  onRemove={() => unsave(job)}
                  removeLabel={`Remove ${job.title} from saved jobs`}
                />
              </li>
            ))}
          </JobList>
        ),
      ),
    },
    {
      value: 'postings',
      label: label('postings', 'Postings'),
      content: body(
        'postings',
        <EmptyState
          headingLevel={2}
          icon={Briefcase}
          title="No job postings"
          description="Post a job to find qualified marketing professionals."
          actions={postButton('sm')}
        />,
        (rows) => (
          <JobList label="My postings">
            {rows.map((job) => (
              <li key={job.id}>
                <JobCard
                  headingLevel={2}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  applicantCount={job.applicant_count || 0}
                  status={
                    <>
                      <StatusBadge status={job.status} size="sm" />
                      {job.unavailable && <Badge size="sm">No longer available</Badge>}
                    </>
                  }
                  postedLabel={`Posted ${formatDate(job.created_at)}`}
                  // Hidden or removed by an admin: members can't see it, but the detail page still
                  // opens for its poster, who can manage the applicants there.
                  to={`${JOBS_PATH}/${job.id}`}
                />
              </li>
            ))}
          </JobList>
        ),
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-ds-lg">
      <div className="flex flex-col gap-ds-md sm:flex-row sm:items-center sm:justify-between">
        <Text tone="secondary">Manage your applications, saved jobs, and postings.</Text>
        {postButton('md')}
      </div>

      <Tabs aria-label="My jobs" items={items} value={tab} onValueChange={changeTab} listClassName="overflow-x-auto" />

      <Dialog
        open={postOpen}
        onOpenChange={setPostOpen}
        size="lg"
        title="Post a New Job"
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={posting} disabled={!form.title.trim() || !form.company.trim()} onClick={postJob}>
              Post Job
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-ds-md">
          <FormField label="Job title" required>
            <Input {...field('title')} placeholder="e.g. Senior Content Strategist" />
          </FormField>
          <FormField label="Company" required>
            <Input {...field('company')} placeholder="e.g. TechFlow" />
          </FormField>
          <div className="grid grid-cols-1 gap-ds-md sm:grid-cols-2">
            <FormField label="Location">
              <Input {...field('location')} placeholder="e.g. Remote, New York, NY" />
            </FormField>
            <FormField label="Job type">
              <Select
                items={JOB_TYPES}
                value={form.type}
                onValueChange={(type) => setForm((prev) => ({ ...prev, type }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-ds-md sm:grid-cols-2">
            <FormField label="Category">
              <Input {...field('category')} placeholder="e.g. Content, Growth, Brand" />
            </FormField>
            <FormField label="Salary range">
              <Input {...field('salary_range')} placeholder="e.g. $120k - $150k" />
            </FormField>
          </div>
          <FormField label="Seniority" hint="Optional">
            <Select
              placeholder="Pick a level"
              items={JOB_SENIORITIES}
              value={form.seniority}
              onValueChange={(seniority) => setForm((prev) => ({ ...prev, seniority }))}
            />
          </FormField>
          <FormField label="Description">
            <Textarea {...field('description')} rows={6} placeholder="Describe the role, responsibilities, and requirements..." />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
