import { JobCard, JobCardSkeleton } from '@/design-system/organisms'
import { useAuth } from '../../context/AuthContext'
import { CatalogList } from './shared/CatalogList'
import { JOB_TYPES, jobCardProps, postedLabel } from './shared/jobs'
import { JOBS_PATH } from './shared/paths'
import { useSavedJobs } from './shared/useSavedJobs'

const FILTERS = [
  { param: 'type', label: 'Job type', allLabel: 'Any type', options: JOB_TYPES },
  { param: 'seniority', label: 'Seniority', allLabel: 'Any seniority', options: ['Junior', 'Mid', 'Senior', 'Lead'] },
  {
    param: 'category',
    label: 'Category',
    allLabel: 'Any category',
    options: ['Content', 'Growth', 'Design', 'Analytics', 'Brand', 'SEO'],
  },
]

const jobsFound = (total) => `${total} job${total !== 1 ? 's' : ''} found`

export default function JobsPage() {
  const { token } = useAuth()
  const { savedIds, setSaved } = useSavedJobs(token)

  return (
    <CatalogList
      endpoint="/api/jobs"
      filters={FILTERS}
      intro="Exclusive job opportunities from the Mavuus community."
      searchLabel="Search jobs"
      searchPlaceholder="Search by title or company..."
      listLabel="Jobs"
      emptyTitle="No jobs found"
      errorTitle="We couldn't load the jobs"
      resultLabel={jobsFound}
      gridClassName="grid grid-cols-1 gap-ds-md"
      skeleton={JobCardSkeleton}
      renderItem={(job) => (
        <JobCard
          {...jobCardProps(job)}
          postedLabel={postedLabel(job.created_at)}
          to={`${JOBS_PATH}/${job.id}`}
          saved={savedIds.has(job.id)}
          onSavedChange={(next) => setSaved(job.id, next)}
        />
      )}
    />
  )
}
