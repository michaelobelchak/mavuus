import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, FileText, Plus } from 'lucide-react'
import { Alert, Dialog, DialogClose, EmptyState, FormField, Tabs, useToast } from '@/design-system/patterns'
import { JobCard, JobCardSkeleton, StatusBadge } from '@/design-system/organisms'
import { Button, Input, Select, Text, Textarea } from '@/design-system/primitives'
import { formatDate } from '@/design-system/lib/formatDate'
import { useAuth } from '../../context/AuthContext'
import { JOB_TYPES, jobCardProps, jobTypeLabel } from './shared/jobs'
import { JOBS_PATH } from './shared/paths'
import { listOf } from './shared/reviewProps'

const TABS = ['applications', 'saved', 'postings']
const LIST = 'flex flex-col gap-ds-md'
const emptyForm = (company) => ({
  title: '',
  company: company || '',
  description: '',
  location: '',
  type: 'full-time',
  category: '',
  salary_range: '',
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
  const [data, setData] = useState({ applications: [], saved: [], postings: [] })
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const removing = useRef(new Set())
  const [postOpen, setPostOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [form, setForm] = useState(() => emptyForm(user?.company))

  const load = useCallback(
    async (signal) => {
      const headers = { Authorization: `Bearer ${token}` }
      const get = async (url) => {
        const res = await fetch(url, { headers, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return listOf(await res.json())
      }
      try {
        const [applications, saved, postings] = await Promise.all([
          get('/api/jobs/my-applications'),
          get('/api/jobs/saved'),
          get('/api/jobs/my-postings'),
        ])
        if (signal?.aborted) return
        setData({ applications, saved, postings })
        setStatus('ready')
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return
        setStatus('error')
      }
    },
    [token],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load, attempt])

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
      setData((prev) => ({ ...prev, saved: prev.saved.filter((row) => row.id !== job.id) }))
      toast.success('Job removed from saved')
    } catch {
      toast.error("Couldn't remove the job. Try again.")
    } finally {
      removing.current.delete(job.id)
    }
  }

  const postJob = async () => {
    if (posting) return
    if (!form.title.trim() || !form.company.trim()) {
      toast.error('Title and company are required')
      return
    }
    setPosting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.error || 'Failed to post job')
        return
      }
      toast.success('Job posted!')
      setPostOpen(false)
      setForm(emptyForm(user?.company))
      await load()
      changeTab('postings')
    } catch {
      toast.error('Failed to post job')
    } finally {
      setPosting(false)
    }
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
    <Button size={size} leadingIcon={Plus} onClick={() => setPostOpen(true)}>
      Post a Job
    </Button>
  )

  let panels
  if (status === 'loading') {
    panels = (
      <ul aria-busy="true" aria-label="Loading your jobs" className={LIST}>
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <JobCardSkeleton announce={false} />
          </li>
        ))}
      </ul>
    )
  } else if (status === 'error') {
    panels = (
      <Alert
        tone="error"
        title="We couldn't load your jobs"
        description="Check your connection and try again."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setStatus('loading')
              setAttempt((n) => n + 1)
            }}
          >
            Try again
          </Button>
        }
      />
    )
  }

  const { applications, saved, postings } = data
  const items = [
    {
      value: 'applications',
      label: `Applications (${applications.length})`,
      content:
        applications.length === 0 ? (
          <EmptyState headingLevel={2} icon={FileText} title="No applications yet" description="Browse jobs and apply to get started." actions={browse} />
        ) : (
          <JobList label="My applications">
            {applications.map((app) => (
              <li key={app.id}>
                <JobCard
                  headingLevel={2}
                  title={app.job_title}
                  company={app.job_company}
                  location={app.job_location}
                  type={jobTypeLabel(app.job_type)}
                  status={<StatusBadge status={app.status} size="sm" />}
                  postedLabel={`Applied ${formatDate(app.applied_at)}`}
                  to={`${JOBS_PATH}/${app.job_id}`}
                />
              </li>
            ))}
          </JobList>
        ),
    },
    {
      value: 'saved',
      label: `Saved (${saved.length})`,
      content:
        saved.length === 0 ? (
          <EmptyState headingLevel={2}
            icon={Bookmark}
            title="No saved jobs"
            description="Bookmark jobs you're interested in to find them here."
            actions={browse}
          />
        ) : (
          <JobList label="Saved jobs">
            {saved.map((job) => (
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
    },
    {
      value: 'postings',
      label: `Postings (${postings.length})`,
      content:
        postings.length === 0 ? (
          <EmptyState headingLevel={2}
            icon={Briefcase}
            title="No job postings"
            description="Post a job to find qualified marketing professionals."
            actions={postButton('sm')}
          />
        ) : (
          <JobList label="My postings">
            {postings.map((job) => (
              <li key={job.id}>
                <JobCard
                  headingLevel={2}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  applicantCount={job.applicant_count || 0}
                  status={<StatusBadge status={job.status} size="sm" />}
                  postedLabel={`Posted ${formatDate(job.created_at)}`}
                  to={`${JOBS_PATH}/${job.id}`}
                />
              </li>
            ))}
          </JobList>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-ds-lg">
      <div className="flex flex-col gap-ds-md sm:flex-row sm:items-center sm:justify-between">
        <Text tone="secondary">Manage your applications, saved jobs, and postings.</Text>
        {postButton('md')}
      </div>

      {panels ?? (
        <Tabs
          aria-label="My jobs"
          items={items}
          value={tab}
          onValueChange={changeTab}
          listClassName="overflow-x-auto"
        />
      )}

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
          <FormField label="Description">
            <Textarea {...field('description')} rows={6} placeholder="Describe the role, responsibilities, and requirements..." />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
