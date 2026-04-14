import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import ReviewCard from '../../components/ui/ReviewCard'
import { Textarea } from '../../components/ui/Input'
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Building2, Send, CheckCircle, Users, Briefcase, Star, ThumbsUp, FileText, Upload } from 'lucide-react'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.button> in JSX
import { motion } from 'motion/react'
import DetailPageHeader from '../../components/ui/DetailPageHeader'
import { fireConfetti } from '../../hooks/useConfetti'

function renderDescription(text) {
  if (!text) return null
  const sections = text.split('\n\n')
  return sections.map((section, i) => {
    const trimmed = section.trim()
    if (!trimmed) return null

    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      const heading = trimmed.replace(/\*\*/g, '')
      return <h4 key={i} className="text-base font-semibold text-dark-blue mt-6 mb-2">{heading}</h4>
    }

    if (trimmed.startsWith('**')) {
      const lines = trimmed.split('\n')
      const headingLine = lines[0].replace(/\*\*/g, '')
      const bullets = lines.slice(1).filter(l => l.trim().startsWith('-'))
      if (bullets.length > 0) {
        return (
          <div key={i} className="mt-5">
            <h4 className="text-base font-semibold text-dark-blue mb-2">{headingLine}</h4>
            <ul className="space-y-1.5 ml-1">
              {bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
                  <span className="w-1.5 h-1.5 bg-brand-pink rounded-full mt-1.5 flex-shrink-0" />
                  {b.replace(/^-\s*/, '').trim()}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    }

    if (trimmed.startsWith('-')) {
      const bullets = trimmed.split('\n').filter(l => l.trim().startsWith('-'))
      return (
        <ul key={i} className="space-y-1.5 ml-1 mt-2">
          {bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="w-1.5 h-1.5 bg-brand-pink rounded-full mt-1.5 flex-shrink-0" />
              {b.replace(/^-\s*/, '').trim()}
            </li>
          ))}
        </ul>
      )
    }

    return <p key={i} className="text-sm text-neutral-600 leading-relaxed mt-2">{trimmed}</p>
  })
}

const jobStatusColors = {
  open: 'green',
  'in-progress': 'blue',
  completed: 'pink',
  closed: 'gray',
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const toast = useToast()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [useProfileResume, setUseProfileResume] = useState(true)
  const [resumeFile, setResumeFile] = useState(null)
  const [profileResume, setProfileResume] = useState(null)
  const [applicants, setApplicants] = useState([])

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState([])

  // Recommend vendor modal state
  const [showRecommendModal, setShowRecommendModal] = useState(false)
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [recommendMessage, setRecommendMessage] = useState('')
  const [submittingRec, setSubmittingRec] = useState(false)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, savedRes, appsRes] = await Promise.all([
          fetch(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs/saved', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (jobRes.ok) {
          const jobData = await jobRes.json()
          setJob(jobData)

          // Fetch applicants if this is my job
          if (jobData.posted_by === user?.id) {
            const appRes = await fetch(`/api/jobs/${id}/applicants`, { headers: { Authorization: `Bearer ${token}` } })
            if (appRes.ok) setApplicants(await appRes.json())
          }

          // Fetch reviews if completed
          if (jobData.status === 'completed' && jobData.hired_user_id) {
            const reviewsRes = await fetch(`/api/reviews/user/${jobData.hired_user_id}`, { headers: { Authorization: `Bearer ${token}` } })
            if (reviewsRes.ok) {
              const allReviews = await reviewsRes.json()
              setReviews(allReviews.filter(r => r.job_id === parseInt(id)))
            }
          }
        }
        if (savedRes.ok) {
          const savedJobs = await savedRes.json()
          setSaved(savedJobs.some(j => j.id === parseInt(id)))
        }
        if (appsRes.ok) {
          const apps = await appsRes.json()
          const myApp = apps.find(a => a.job_id === parseInt(id))
          if (myApp) setApplied(myApp)
        }
        // Check if user has profile resume
        const profileRes = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.resume_url) setProfileResume(profileData.resume_url)
        }
      } catch { /* silent */ } finally { setLoading(false) }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toggleSave = async () => {
    try {
      if (saved) {
        await fetch(`/api/jobs/${id}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        setSaved(false)
        toast.info('Job removed from saved')
      } else {
        await fetch(`/api/jobs/${id}/save`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
        setSaved(true)
        toast.success('Job saved!')
      }
    } catch { /* silent */ }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const body = { cover_letter: coverLetter }
      if (useProfileResume && profileResume) {
        body.resume_url = profileResume
      } else if (resumeFile) {
        // Upload resume first
        const formData = new FormData()
        formData.append('resume', resumeFile)
        const uploadRes = await fetch('/api/profile/me/resume', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          body.resume_url = uploadData.resume_url
        }
      }
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST', headers, body: JSON.stringify(body)
      })
      if (res.ok) {
        fireConfetti()
        toast.success('Application submitted!')
        setShowApplyModal(false)
        setApplied({ status: 'applied', applied_at: new Date().toISOString() })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to apply')
      }
    } catch { toast.error('Network error') }
    finally { setApplying(false) }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setJob(prev => ({ ...prev, status: newStatus }))
        toast.success(`Job marked as ${newStatus}`)
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleHire = async (applicationId, userId) => {
    try {
      const res = await fetch(`/api/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'hired' }),
      })
      if (res.ok) {
        setJob(prev => ({ ...prev, status: 'in-progress', hired_user_id: userId }))
        setApplicants(prev => prev.map(a =>
          a.id === applicationId ? { ...a, status: 'hired' } : a
        ))
        toast.success('Applicant hired! Job status changed to in-progress.')
      }
    } catch {
      toast.error('Failed to hire applicant')
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewRating) return toast.error('Please select a rating')
    setSubmittingReview(true)
    try {
      const revieweeId = job.posted_by === user?.id ? job.hired_user_id : job.posted_by
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reviewee_id: revieweeId,
          job_id: parseInt(id),
          rating: reviewRating,
          text: reviewText,
        }),
      })
      if (res.ok) {
        toast.success('Review submitted!')
        setShowReviewModal(false)
        setReviewRating(0)
        setReviewText('')
        // Refresh reviews
        const reviewsRes = await fetch(`/api/reviews/user/${revieweeId}`, { headers: { Authorization: `Bearer ${token}` } })
        if (reviewsRes.ok) {
          const allReviews = await reviewsRes.json()
          setReviews(allReviews.filter(r => r.job_id === parseInt(id)))
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch { toast.error('Network error') }
    finally { setSubmittingReview(false) }
  }

  const handleRecommendVendor = async () => {
    if (!selectedVendor || !recommendMessage) return
    setSubmittingRec(true)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to_user_id: job.posted_by,
          vendor_id: selectedVendor,
          message: recommendMessage,
        }),
      })
      if (res.ok) {
        toast.success('Recommendation sent!')
        setShowRecommendModal(false)
        setSelectedVendor(null)
        setRecommendMessage('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send recommendation')
      }
    } catch { toast.error('Network error') }
    finally { setSubmittingRec(false) }
  }

  const openRecommendModal = async () => {
    try {
      const res = await fetch('/api/vendors', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setVendors(await res.json())
    } catch { /* silent */ }
    setShowRecommendModal(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Job not found</p>
        <Link to="/dashboard/jobs" className="text-brand-pink hover:underline mt-2 inline-block">Back to Jobs</Link>
      </div>
    )
  }

  const isMyJob = job.posted_by === user?.id
  const isCompleted = job.status === 'completed'
  const appStatusColors = {
    applied: 'blue', reviewing: 'pink', interview: 'green', offer: 'green', rejected: 'gray', hired: 'pink'
  }

  return (
    <div className="max-w-6xl">
      <DetailPageHeader backLabel="Back to Jobs" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-dark-blue">{job.title}</h1>
                  {job.seniority && <Badge variant="pink">{job.seniority}</Badge>}
                  <Badge variant={jobStatusColors[job.status] || 'gray'}>{job.status}</Badge>
                </div>
                <p className="text-lg text-neutral-600 flex items-center gap-2">
                  <Building2 size={18} /> {job.company}
                </p>
              </div>
              <motion.button
                onClick={toggleSave}
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-neutral-400 hover:text-brand-pink transition-colors cursor-pointer flex-shrink-0"
                aria-label={saved ? 'Unsave job' : 'Save job'}
              >
                {saved ? <BookmarkCheck size={24} className="text-brand-pink fill-brand-pink" /> : <Bookmark size={24} />}
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {job.location && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <MapPin size={14} /> {job.location}
                </span>
              )}
              {job.type && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <Clock size={14} /> {job.type}
                </span>
              )}
              {job.salary_range && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                  <DollarSign size={14} /> {job.salary_range}
                </span>
              )}
              {job.category && <Badge variant="blue">{job.category}</Badge>}
            </div>

            {/* Hired user info */}
            {job.hired_name && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-6">
                <Avatar name={job.hired_name} src={job.hired_avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {job.hired_user_id === user?.id ? 'You were' : `${job.hired_name} was`} hired for this role
                  </p>
                  <p className="text-xs text-blue-600">Status: {job.status}</p>
                </div>
              </div>
            )}

            {applied && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl mb-6">
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">You applied for this position</p>
                  <p className="text-xs text-green-600">
                    Applied {new Date(applied.applied_at).toLocaleDateString()} · Status: <Badge variant={appStatusColors[applied.status] || 'gray'}>{applied.status}</Badge>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">About this role</h3>
            <div>
              {renderDescription(job.description) || (
                <p className="text-neutral-500">No detailed description provided.</p>
              )}
            </div>
          </div>

          {/* Applicants (for job poster) */}
          {isMyJob && applicants.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <Users size={18} /> Applicants ({applicants.length})
              </h3>
              <div className="space-y-3">
                {applicants.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                    <Link to={`/dashboard/members/${app.user_id}`} className="flex items-center gap-3 no-underline">
                      <Avatar name={app.name} src={app.avatar_url} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-dark-blue">{app.name}</p>
                        <p className="text-xs text-neutral-500">{app.user_title} at {app.user_company}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {(app.resume_url || app.profile_resume_url) && (
                        <a href={app.resume_url || app.profile_resume_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                          <FileText size={12} /> Resume
                        </a>
                      )}
                      <Badge variant={appStatusColors[app.status] || 'gray'}>{app.status}</Badge>
                      {app.status !== 'hired' && job.status === 'open' && (
                        <Button size="sm" onClick={() => handleHire(app.id, app.user_id)}>
                          Hire
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews for completed job */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <Star size={18} /> Reviews
              </h3>
              <div className="space-y-3">
                {reviews.map(review => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            {isMyJob ? (
              <>
                <p className="text-sm text-neutral-500 mb-3">You posted this job</p>
                {/* Status change dropdown */}
                <div className="mb-3">
                  <label className="text-xs text-neutral-500 mb-1 block">Change Status</label>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {isCompleted && job.hired_user_id && (
                  <Button className="w-full mb-3" onClick={() => setShowReviewModal(true)}>
                    <Star size={16} /> Leave a Review
                  </Button>
                )}
                <Link to="/dashboard/my-jobs">
                  <Button variant="outline" className="w-full"><Users size={16} /> View Applicants</Button>
                </Link>
              </>
            ) : applied ? (
              <>
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle size={16} /> Applied
                </Button>
                {isCompleted && job.hired_user_id === user?.id && (
                  <Button className="w-full mt-3" onClick={() => setShowReviewModal(true)}>
                    <Star size={16} /> Leave a Review
                  </Button>
                )}
              </>
            ) : job.status === 'open' ? (
              <Button className="w-full" onClick={() => setShowApplyModal(true)}>
                <Send size={16} /> Apply Now
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                This position is {job.status}
              </Button>
            )}
            <Button variant="outline" className="w-full mt-3" onClick={toggleSave}>
              {saved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save Job</>}
            </Button>
          </div>

          {/* Recommend a Vendor */}
          {!isMyJob && job.status === 'open' && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <Button variant="outline" className="w-full" onClick={openRecommendModal}>
                <ThumbsUp size={16} /> Recommend a Vendor
              </Button>
            </div>
          )}

          {/* Job Meta */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h4 className="font-semibold text-dark-blue mb-3">Job Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <Badge variant={jobStatusColors[job.status] || 'gray'}>{job.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Posted</span>
                <span className="text-dark-blue">{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Type</span>
                <span className="text-dark-blue capitalize">{job.type || 'N/A'}</span>
              </div>
              {job.seniority && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Seniority</span>
                  <span className="text-dark-blue">{job.seniority}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Category</span>
                <span className="text-dark-blue">{job.category || 'N/A'}</span>
              </div>
              {job.salary_range && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Salary</span>
                  <span className="text-dark-blue">{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Posted By */}
          {job.poster_name && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h4 className="font-semibold text-dark-blue mb-3">Posted by</h4>
              <Link to={`/dashboard/members/${job.posted_by}`} className="flex items-center gap-3 hover:bg-neutral-50 rounded-xl p-2 -m-2 transition-colors">
                <Avatar name={job.poster_name} src={job.poster_avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium text-dark-blue">{job.poster_name}</p>
                  <p className="text-xs text-neutral-500">{job.poster_title}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title={`Apply for ${job.title}`} size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <p className="text-sm font-medium text-dark-blue">{job.title}</p>
            <p className="text-xs text-neutral-500">{job.company} · {job.location}</p>
          </div>
          <Textarea
            label="Cover Letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            placeholder="Tell the employer why you're a great fit for this role..."
          />
          {/* Resume Options */}
          <div>
            <label className="text-sm font-medium text-dark-blue mb-2 block">Resume</label>
            {profileResume ? (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input type="radio" checked={useProfileResume} onChange={() => { setUseProfileResume(true); setResumeFile(null) }} />
                  <FileText size={14} /> Use profile resume
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input type="radio" checked={!useProfileResume} onChange={() => setUseProfileResume(false)} />
                  <Upload size={14} /> Upload a different resume
                </label>
                {!useProfileResume && (
                  <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    className="text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-pink/10 file:text-brand-pink file:font-medium file:text-sm file:cursor-pointer" />
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-500 mb-2">Upload a resume (PDF, max 5MB)</p>
                <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)}
                  className="text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-pink/10 file:text-brand-pink file:font-medium file:text-sm file:cursor-pointer" />
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500">Your profile information will be shared with the employer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Leave a Review">
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <p className="text-sm font-medium text-dark-blue">{job.title}</p>
            <p className="text-xs text-neutral-500">
              Reviewing: {isMyJob ? job.hired_name : job.poster_name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-blue mb-2 block">Rating</label>
            <StarRating rating={reviewRating} onChange={setReviewRating} size={24} />
          </div>
          <Textarea
            label="Your Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Share your experience working together..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview || !reviewRating}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recommend Vendor Modal */}
      <Modal isOpen={showRecommendModal} onClose={() => setShowRecommendModal(false)} title="Recommend a Vendor">
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">
            Recommend a vendor for this job to {job.poster_name}.
          </p>
          <div>
            <label className="text-sm font-medium text-dark-blue mb-2 block">Select Vendor</label>
            <select
              value={selectedVendor || ''}
              onChange={(e) => setSelectedVendor(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            >
              <option value="">Choose a vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.company_name} — {v.categories}</option>
              ))}
            </select>
          </div>
          <Textarea
            label="Message"
            value={recommendMessage}
            onChange={(e) => setRecommendMessage(e.target.value)}
            rows={3}
            placeholder="Why do you recommend this vendor for this role?"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowRecommendModal(false)}>Cancel</Button>
            <Button onClick={handleRecommendVendor} disabled={submittingRec || !selectedVendor || !recommendMessage}>
              {submittingRec ? 'Sending...' : 'Send Recommendation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
