import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bookmark, Building2, CheckCircle, Clock, DollarSign, FileText, MapPin, Send, Star, ThumbsUp } from 'lucide-react'
import {
  Alert,
  Card,
  DescriptionList,
  Dialog,
  DialogClose,
  FormField,
  ShareDialog,
  useToast,
} from '@/design-system/patterns'
import { CompanyLogo, MetaList, ReviewCard, StarRating, StatusBadge } from '@/design-system/organisms'
import {
  Avatar,
  Badge,
  Button,
  Caption,
  Heading,
  Input,
  Link,
  RadioGroup,
  Select,
  Text,
  Textarea,
} from '@/design-system/primitives'
import { formatDate } from '@/design-system/lib/formatDate'
import { useAuth } from '../../context/AuthContext'
import { fireConfetti } from '../../hooks/useConfetti'
import { useDetailResource } from '../../hooks/useDetailResource'
import { DetailError, DetailLayout, DetailNotFound, DetailSkeleton, DetailTopBar } from './shared/DetailChrome'
import { DetailSection } from './shared/DetailSection'
import { errorMessage } from './shared/errorMessage'
import { resumeHref as resumeLink } from './shared/resumeHref'
import { JOB_STATUSES, jobTypeLabel } from './shared/jobs'
import { JOBS_PATH, MEMBERS_PATH } from './shared/paths'
import { listOf, reviewCardProps } from './shared/reviewProps'
import { useSavedJobs } from './shared/useSavedJobs'

const BACK = { backTo: JOBS_PATH, backLabel: 'Back to Jobs' }
const MY_POSTINGS = '/dashboard/my-jobs?tab=postings'
const MAX_RESUME_BYTES = 5 * 1024 * 1024
// What's wrong with a picked resume file, or null. The server checks the file's content too.
function resumeProblem(file) {
  if (!file) return null
  const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!pdf) return 'Choose a PDF file.'
  if (file.size > MAX_RESUME_BYTES) return 'Choose a PDF of 5 MB or less.'
  return null
}
const statusLabel = (status) => JOB_STATUSES.find((option) => option.value === status)?.label ?? status

const bulletsOf = (lines) => lines.filter((line) => line.trim().startsWith('-')).map((line) => line.replace(/^\s*-\s*/, '').trim())

function Bullets({ items }) {
  return (
    <ul className="flex list-disc flex-col gap-ds-xxs pl-ds-lg marker:text-text-brand-strong">
      {items.map((item, i) => (
        <li key={i}>
          <Text as="span" size="body-sm" tone="secondary">
            {item}
          </Text>
        </li>
      ))}
    </ul>
  )
}

/** A job description: paragraphs, "**Heading**" lines and "- " bullet lists. */
function JobDescription({ text }) {
  const blocks = (text || '').split('\n\n').map((block) => block.trim()).filter(Boolean)
  if (blocks.length === 0) {
    return (
      <Text size="body-sm" tone="secondary">
        No detailed description provided.
      </Text>
    )
  }
  return (
    <div className="flex flex-col gap-ds-sm">
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        if (block.startsWith('**')) {
          const bullets = bulletsOf(lines.slice(1))
          return (
            <div key={i} className="flex flex-col gap-ds-xs">
              <Text as="h3" className="font-semibold">
                {lines[0].replace(/\*\*/g, '')}
              </Text>
              {bullets.length > 0 && <Bullets items={bullets} />}
            </div>
          )
        }
        if (block.startsWith('-')) return <Bullets key={i} items={bulletsOf(lines)} />
        return (
          <Text key={i} size="body-sm" tone="secondary">
            {block}
          </Text>
        )
      })}
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const jobId = parseInt(id, 10)
  const { user, token } = useAuth()
  const toast = useToast()
  const auth = { Authorization: `Bearer ${token}` }
  const json = { ...auth, 'Content-Type': 'application/json' }
  const { data: loaded, loading, error, notFound, retry } = useDetailResource(`/api/jobs/${id}`, token)
  // Local changes on top of the loaded job (a new status, a hire). The route remounts this page
  // for another :id (KeyedById), so they never carry over.
  const [patch, setPatch] = useState({})
  const job = loaded ? { ...loaded, ...patch } : null
  const { savedIds, setSaved } = useSavedJobs(token)
  const [applied, setApplied] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [reviews, setReviews] = useState([])
  const [profileResume, setProfileResume] = useState(null)
  const [busy, setBusy] = useState(null)
  // The guard itself is a ref, so two clicks in the same frame can't both start a request.
  const busyRef = useRef(null)
  const [shareOpen, setShareOpen] = useState(false)

  const [applyOpen, setApplyOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeChoice, setResumeChoice] = useState('profile')
  const [resumeFile, setResumeFile] = useState(null)

  const [hireTarget, setHireTarget] = useState(null)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const [recommendOpen, setRecommendOpen] = useState(false)
  const [vendors, setVendors] = useState([])
  const [vendorId, setVendorId] = useState(null)
  const [recommendMessage, setRecommendMessage] = useState('')
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const vendorsRequest = useRef(null)
  const [applicantsError, setApplicantsError] = useState(false)
  const [applicantsAttempt, setApplicantsAttempt] = useState(0)

  const isMyJob = Boolean(loaded && user) && Number(loaded.posted_by) === Number(user.id)
  const hiredUserId = job?.hired_user_id
  const postedBy = loaded?.posted_by

  // Reviews left on this job, both ways (poster about the hire, hire about the poster).
  const loadReviews = async (signal) => {
    const people = [hiredUserId, postedBy].filter(Boolean)
    const lists = await Promise.all(
      people.map((person) =>
        fetch(`/api/reviews/user/${person}`, { headers: auth, signal })
          .then((res) => (res.ok ? res.json() : []))
          .then(listOf)
          .catch(() => []),
      ),
    )
    const forJob = lists.flat().filter((review) => Number(review.job_id) === jobId)
    if (!signal?.aborted) setReviews(forJob)
  }

  // The member's application, their profile resume, the applicants (poster) and the reviews.
  useEffect(() => {
    if (!loaded) return
    const controller = new AbortController()
    const get = (url) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    // The poster can't apply to their own job, so there is no application to look for.
    if (!isMyJob) {
      get('/api/jobs/my-applications').then((apps) => {
        const mine = listOf(apps).find((app) => Number(app.job_id) === jobId)
        if (!controller.signal.aborted && mine) setApplied(mine)
      })
      get('/api/profile/me').then((profile) => {
        if (!controller.signal.aborted && profile?.resume_url) setProfileResume(profile.resume_url)
      })
    }
    if (loaded.status === 'completed' && loaded.hired_user_id) loadReviews(controller.signal)
    return () => controller.abort()
    // loadReviews reads the same loaded job; it only needs to run once per job.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, isMyJob, jobId, token])

  // The applicants, for the poster, with their own error and Try again.
  useEffect(() => {
    if (!loaded || !isMyJob) return
    const controller = new AbortController()
    fetch(`/api/jobs/${jobId}/applicants`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows = listOf(await res.json())
        if (!controller.signal.aborted) {
          setApplicants(rows)
          setApplicantsError(false)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== 'AbortError') setApplicantsError(true)
      })
    return () => controller.abort()
  }, [loaded, isMyJob, jobId, token, applicantsAttempt])

  // Leaving the page drops a vendors request still running.
  useEffect(() => () => vendorsRequest.current?.abort(), [])

  if (loading) return <DetailSkeleton label="Loading job" />
  if (error) return <DetailError title="We couldn't load this job" onRetry={retry} {...BACK} />
  if (notFound || !job) return <DetailNotFound title="Job not found" {...BACK} />

  const saved = savedIds.has(job.id)
  const isCompleted = job.status === 'completed'
  const reviewed = Boolean(user) && reviews.some((review) => Number(review.reviewer_id) === Number(user.id))
  const canReview = isCompleted && Boolean(hiredUserId) && (isMyJob || (applied && Number(hiredUserId) === Number(user?.id)))
  const reviewee = isMyJob ? job.hired_name : job.poster_name

  // One action at a time per kind: a second click while a request runs does nothing.
  const run = async (kind, action) => {
    if (busyRef.current) return
    busyRef.current = kind
    setBusy(kind)
    try {
      await action()
    } finally {
      busyRef.current = null
      setBusy(null)
    }
  }
  const errorOf = errorMessage
  // Uploading a different resume needs a file; any picked file must be a PDF of 5 MB or less.
  const uploading = !profileResume || resumeChoice === 'upload'
  const fileError = uploading ? resumeProblem(resumeFile) : null
  const missingFile = Boolean(profileResume) && resumeChoice === 'upload' && !resumeFile

  const handleApply = () =>
    run('apply', async () => {
      try {
        const body = { cover_letter: coverLetter }
        if (profileResume && resumeChoice === 'profile') {
          body.resume_url = profileResume
        } else if (resumeFile) {
          const formData = new FormData()
          formData.append('resume', resumeFile)
          const upload = await fetch('/api/profile/me/resume', { method: 'POST', headers: auth, body: formData })
          if (!upload.ok) {
            toast.error(await errorOf(upload, "Couldn't upload your resume. Try again."))
            return
          }
          // The upload answers { success, filename, url }.
          body.resume_url = (await upload.json()).url
        }
        const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST', headers: json, body: JSON.stringify(body) })
        if (!res.ok) {
          toast.error(await errorOf(res, 'Failed to apply'))
          return
        }
        fireConfetti()
        toast.success('Application submitted!')
        setApplyOpen(false)
        setApplied({ status: 'applied', applied_at: new Date().toISOString() })
      } catch {
        toast.error('Network error')
      }
    })

  const handleStatusChange = (status) => {
    if (!status || status === job.status) return
    run('status', async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { method: 'PUT', headers: json, body: JSON.stringify({ status }) })
        if (!res.ok) {
          toast.error(await errorOf(res, 'Failed to update status'))
          return
        }
        setPatch((prev) => ({ ...prev, status }))
        toast.success(`Job marked as ${statusLabel(status).toLowerCase()}`)
      } catch {
        toast.error('Failed to update status')
      }
    })
  }

  const handleHire = () =>
    run('hire', async () => {
      const applicant = hireTarget
      try {
        const res = await fetch(`/api/jobs/applications/${applicant.id}/status`, {
          method: 'PUT',
          headers: json,
          body: JSON.stringify({ status: 'hired' }),
        })
        if (!res.ok) {
          toast.error(await errorOf(res, 'Failed to hire applicant'))
          return
        }
        setPatch((prev) => ({
          ...prev,
          status: 'in-progress',
          hired_user_id: applicant.user_id,
          hired_name: applicant.name,
          hired_avatar: applicant.avatar_url,
        }))
        setApplicants((prev) => prev.map((app) => (app.id === applicant.id ? { ...app, status: 'hired' } : app)))
        setHireTarget(null)
        toast.success('Applicant hired! Job status changed to in progress.')
      } catch {
        toast.error('Failed to hire applicant')
      }
    })

  // Submit stays disabled until a rating is picked.
  const handleSubmitReview = () =>
    run('review', async () => {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: json,
          body: JSON.stringify({
            reviewee_id: isMyJob ? hiredUserId : job.posted_by,
            job_id: jobId,
            rating: reviewRating,
            text: reviewText,
          }),
        })
        if (!res.ok) {
          toast.error(await errorOf(res, 'Failed to submit review'))
          return
        }
        toast.success('Review submitted!')
        setReviewOpen(false)
        setReviewRating(0)
        setReviewText('')
        await loadReviews()
      } catch {
        toast.error('Network error')
      }
    })

  const openRecommend = async () => {
    setRecommendOpen(true)
    vendorsRequest.current?.abort()
    const controller = new AbortController()
    vendorsRequest.current = controller
    setVendorsLoading(true)
    try {
      const res = await fetch('/api/vendors?limit=100', { headers: auth, signal: controller.signal })
      if (res.ok && !controller.signal.aborted) setVendors(listOf(await res.json()))
    } catch {
      // Aborted or offline: the select stays as it was.
    } finally {
      if (vendorsRequest.current === controller) setVendorsLoading(false)
    }
  }
  const changeRecommendOpen = (open) => {
    setRecommendOpen(open)
    if (!open) vendorsRequest.current?.abort()
  }

  const handleRecommend = () =>
    run('recommend', async () => {
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: json,
          body: JSON.stringify({ to_user_id: job.posted_by, vendor_id: vendorId, message: recommendMessage }),
        })
        if (!res.ok) {
          toast.error(await errorOf(res, 'Failed to send recommendation'))
          return
        }
        toast.success('Recommendation sent!')
        setRecommendOpen(false)
        setVendorId(null)
        setRecommendMessage('')
      } catch {
        toast.error('Network error')
      }
    })

  let primaryAction
  if (isMyJob) {
    primaryAction = (
      <>
        <Caption>You posted this job</Caption>
        <FormField label="Change status">
          <Select
            items={JOB_STATUSES}
            value={job.status}
            disabled={busy === 'status'}
            onValueChange={handleStatusChange}
          />
        </FormField>
      </>
    )
  } else if (applied) {
    primaryAction = (
      <Button block variant="outline" leadingIcon={CheckCircle} disabled>
        Applied
      </Button>
    )
  } else if (job.status === 'open') {
    primaryAction = (
      <Button block leadingIcon={Send} onClick={() => setApplyOpen(true)}>
        Apply Now
      </Button>
    )
  } else {
    primaryAction = (
      <Button block variant="outline" disabled>
        {`This position is ${statusLabel(job.status).toLowerCase()}`}
      </Button>
    )
  }

  const resumeHref = (app) => resumeLink(app.resume_url) || resumeLink(app.profile_resume_url)

  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailTopBar {...BACK} onShare={() => setShareOpen(true)} />
      <DetailLayout
        asideLabel="Job info"
        main={
          <>
            <Card as="article" aria-labelledby="job-title" padding="lg" className="flex flex-col gap-ds-md">
              <div className="flex items-start gap-ds-md">
                <CompanyLogo name={job.company} size="lg" />
                <div className="flex min-w-0 grow flex-col gap-ds-xs">
                  <div className="flex flex-wrap items-center gap-ds-xs">
                    <Heading id="job-title" level={2} size="h3" className="min-w-0 break-words">
                      {job.title}
                    </Heading>
                    {job.seniority && <Badge size="sm">{job.seniority}</Badge>}
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <MetaList items={[{ key: 'company', icon: Building2, label: job.company }]} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-ds-sm">
                <MetaList
                  items={[
                    { key: 'location', icon: MapPin, label: job.location },
                    { key: 'type', icon: Clock, label: jobTypeLabel(job.type) },
                    { key: 'salary', icon: DollarSign, label: job.salary_range },
                  ]}
                />
                {job.category && (
                  <Badge size="sm" tone="info">
                    {job.category}
                  </Badge>
                )}
              </div>
              {job.hired_name && (
                <Card variant="surface" padding="sm" className="flex items-center gap-ds-sm">
                  <Avatar name={job.hired_name} src={job.hired_avatar || undefined} size="sm" />
                  <div className="flex min-w-0 flex-col">
                    <Text size="body-sm" className="font-semibold">
                      {Number(hiredUserId) === Number(user?.id) ? 'You were hired for this role' : `${job.hired_name} was hired for this role`}
                    </Text>
                    <Caption>{`Status: ${statusLabel(job.status)}`}</Caption>
                  </div>
                </Card>
              )}
              {applied && (
                <Alert tone="success" title="You applied for this position">
                  <div className="flex flex-wrap items-center gap-ds-xs">
                    <Caption>{`Applied ${formatDate(applied.applied_at)}`}</Caption>
                    <StatusBadge status={applied.status} size="sm" />
                  </div>
                </Alert>
              )}
            </Card>
          </>
        }
        comments={
          // The rest of the job sits in the layout's lower slot, so below 1024px Apply and the
          // job facts come right after the header instead of after a long description.
          <div className="flex flex-col gap-ds-lg">
            <DetailSection title="About this role">
              <JobDescription text={job.description} />
            </DetailSection>

            {isMyJob && (
              <DetailSection title={applicantsError ? 'Applicants' : `Applicants (${applicants.length})`}>
                {applicantsError ? (
                  <Alert
                    tone="error"
                    title="We couldn't load the applicants"
                    description="Check your connection and try again."
                    actions={
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setApplicantsError(false)
                          setApplicantsAttempt((n) => n + 1)
                        }}
                      >
                        Try again
                      </Button>
                    }
                  />
                ) : applicants.length === 0 ? (
                  <Text size="body-sm" tone="secondary">
                    No applicants yet.
                  </Text>
                ) : (
                  <ul aria-label="Applicants" className="flex flex-col gap-ds-xs">
                    {applicants.map((app) => (
                      <li key={app.id}>
                        <Card variant="surface" padding="sm" className="flex flex-wrap items-center justify-between gap-ds-sm">
                          <div className="flex min-w-0 items-center gap-ds-sm">
                            <Avatar name={app.name} src={app.avatar_url || undefined} size="sm" />
                            <div className="flex min-w-0 flex-col">
                              <Link to={`${MEMBERS_PATH}/${app.user_id}`} className="font-semibold">
                                {app.name}
                              </Link>
                              <Caption>{[app.user_title, app.user_company].filter(Boolean).join(' at ')}</Caption>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-ds-xs">
                            {resumeHref(app) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                leadingIcon={FileText}
                                href={resumeHref(app)}
                                aria-label={`Resume of ${app.name} (opens in a new tab)`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Resume
                              </Button>
                            )}
                            <StatusBadge status={app.status} size="sm" />
                            {app.status !== 'hired' && job.status === 'open' && (
                              <Button size="sm" aria-label={`Hire ${app.name}`} onClick={() => setHireTarget(app)}>
                                Hire
                              </Button>
                            )}
                          </div>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </DetailSection>
            )}

            {reviews.length > 0 && (
              <DetailSection title="Reviews">
                <ul className="flex flex-col gap-ds-sm">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard {...reviewCardProps(review)} />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </div>
        }
        aside={
          <>
            <Card padding="lg" className="flex flex-col gap-ds-sm">
              {primaryAction}
              {canReview &&
                (reviewed ? (
                  <Caption className="text-center">You reviewed this job</Caption>
                ) : (
                  <Button block leadingIcon={Star} onClick={() => setReviewOpen(true)}>
                    Leave a Review
                  </Button>
                ))}
              {isMyJob && (
                <Button block variant="outline" to={MY_POSTINGS}>
                  My postings
                </Button>
              )}
              <Button
                block
                variant="outline"
                leadingIcon={Bookmark}
                aria-pressed={saved}
                onClick={() => setSaved(job.id, !saved)}
              >
                {saved ? 'Saved' : 'Save Job'}
              </Button>
            </Card>

            {!isMyJob && job.status === 'open' && (
              <Card padding="lg">
                <Button block variant="outline" leadingIcon={ThumbsUp} onClick={openRecommend}>
                  Recommend a Vendor
                </Button>
              </Card>
            )}

            <DetailSection title="Job details">
              <DescriptionList
                items={[
                  { key: 'status', label: 'Status', value: <StatusBadge status={job.status} size="sm" /> },
                  { key: 'posted', label: 'Posted', value: formatDate(job.created_at) },
                  { key: 'type', label: 'Type', value: jobTypeLabel(job.type) || 'N/A' },
                  { key: 'seniority', label: 'Seniority', value: job.seniority },
                  { key: 'category', label: 'Category', value: job.category || 'N/A' },
                  { key: 'salary', label: 'Salary', value: job.salary_range },
                ]}
              />
            </DetailSection>

            {job.poster_name && (
              <DetailSection title="Posted by">
                <div className="flex items-center gap-ds-sm">
                  <Avatar name={job.poster_name} src={job.poster_avatar || undefined} size="sm" />
                  <div className="flex min-w-0 flex-col">
                    <Link to={`${MEMBERS_PATH}/${job.posted_by}`} className="font-semibold">
                      {job.poster_name}
                    </Link>
                    {job.poster_title && <Caption>{job.poster_title}</Caption>}
                  </div>
                </div>
              </DetailSection>
            )}
          </>
        }
      />

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} title={`Share ${job.title}`} shareTitle={job.title} />

      <Dialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        size="lg"
        title={`Apply for ${job.title}`}
        description={[job.company, job.location].filter(Boolean).join(' · ')}
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={busy === 'apply'} disabled={Boolean(fileError) || missingFile} onClick={handleApply}>
              Submit Application
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-ds-md">
          <FormField label="Cover letter" hint="Optional">
            <Textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              rows={6}
              placeholder="Tell the employer why you're a great fit for this role..."
            />
          </FormField>
          {profileResume && (
            <RadioGroup
              label="Resume"
              value={resumeChoice}
              onValueChange={setResumeChoice}
              options={[
                { value: 'profile', label: 'Use my profile resume' },
                { value: 'upload', label: 'Upload a different resume' },
              ]}
            />
          )}
          {(!profileResume || resumeChoice === 'upload') && (
            <FormField
              label={profileResume ? 'Resume file' : 'Resume'}
              hint="PDF, up to 5 MB. Uploading also replaces the resume on your profile."
              error={fileError || (missingFile ? 'Choose a PDF to upload.' : undefined)}
            >
              <Input
                type="file"
                accept=".pdf"
                className="py-ds-sm file:mr-ds-sm file:rounded-control file:border-0 file:bg-surface-sunken file:px-ds-sm file:py-ds-xxs file:font-semibold file:text-text-primary"
                onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
            </FormField>
          )}
          <Caption>Your profile information will be shared with the employer.</Caption>
        </div>
      </Dialog>

      <Dialog
        open={hireTarget !== null}
        onOpenChange={(open) => !open && setHireTarget(null)}
        size="sm"
        title={hireTarget ? `Hire ${hireTarget.name}?` : 'Hire applicant'}
        description="The job moves to in progress and the applicant is told."
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={busy === 'hire'} onClick={handleHire}>
              Hire
            </Button>
          </>
        }
      />

      <Dialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title="Leave a Review"
        description={reviewee ? `${job.title}. Reviewing ${reviewee}.` : job.title}
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={busy === 'review'} disabled={!reviewRating} onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-ds-md">
          <StarRating value={reviewRating} onChange={setReviewRating} label="Rating" showLabel />
          <FormField label="Your review">
            <Textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={4}
              placeholder="Share your experience working together..."
            />
          </FormField>
        </div>
      </Dialog>

      <Dialog
        open={recommendOpen}
        onOpenChange={changeRecommendOpen}
        title="Recommend a Vendor"
        description={`Recommend a vendor for this job to ${job.poster_name || 'the poster'}.`}
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={busy === 'recommend'} disabled={!vendorId || !recommendMessage.trim()} onClick={handleRecommend}>
              Send Recommendation
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-ds-md">
          <FormField label="Vendor" hint={vendorsLoading ? 'Loading vendors...' : undefined}>
            <Select
              disabled={vendorsLoading}
              placeholder="Choose a vendor..."
              items={vendors.map((vendor) => ({
                value: vendor.id,
                label: [vendor.company_name, [].concat(vendor.categories || []).join(', ')].filter(Boolean).join(' - '),
              }))}
              value={vendorId}
              onValueChange={setVendorId}
            />
          </FormField>
          <FormField label="Message">
            <Textarea
              value={recommendMessage}
              onChange={(event) => setRecommendMessage(event.target.value)}
              rows={3}
              placeholder="Why do you recommend this vendor for this role?"
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
