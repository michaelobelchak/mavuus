import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Globe, MapPin, MessageCircle } from 'lucide-react'
import { Card, DescriptionList, Dialog, DialogClose, FormField, ShareDialog, useToast } from '@/design-system/patterns'
import { CommentThread, CompanyLogo, MetaList, RecommendationCard, ReviewCard, StarRating } from '@/design-system/organisms'
import { Badge, Button, Caption, Heading, Text, Textarea } from '@/design-system/primitives'
import { isHttpUrl } from '@/design-system/lib/safeUrl'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { useDetailResource } from '../../hooks/useDetailResource'
import { DetailError, DetailLayout, DetailNotFound, DetailSkeleton, DetailTopBar } from './shared/DetailChrome'
import { DetailSection, JobLinkList } from './shared/DetailSection'
import { JOBS_PATH, MESSAGES_PATH, VENDORS_PATH } from './shared/paths'
import { listOf, recommendationCardProps, reviewCardProps } from './shared/reviewProps'

const BACK = { backTo: VENDORS_PATH, backLabel: 'Back to Vendors' }
const NO_LISTS = { jobs: [], reviews: [], recommendations: [] }

const reviewsLabel = (count) => `${count} review${count !== 1 ? 's' : ''}`

export default function VendorDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const auth = { Authorization: `Bearer ${token}` }
  const { data: loaded, loading, error, notFound, retry } = useDetailResource(`/api/vendors/${id}`, token)
  // Per-vendor state is stored with the id it belongs to, so another :id never shows it. A review
  // reloads the vendor (rating, count) into `fresh` instead of reloading the whole page.
  const [fresh, setFresh] = useState({ id: null, vendor: null })
  const [lists, setLists] = useState({ id: null, ...NO_LISTS })
  const vendor = fresh.id === id && fresh.vendor ? fresh.vendor : loaded
  const { jobs, reviews, recommendations } = lists.id === id ? lists : NO_LISTS
  const comments = useComments('vendor', parseInt(id, 10))
  const [shareOpen, setShareOpen] = useState(false)
  const [contacting, setContacting] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const vendorUserId = loaded?.user_id

  // Reviews, recommendations and the jobs the vendor's account posted.
  useEffect(() => {
    if (!loaded) return
    const controller = new AbortController()
    const get = (url) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then(listOf)
        .catch(() => [])
    Promise.all([get('/api/jobs'), get(`/api/reviews/vendor/${id}`), get(`/api/recommendations/vendor/${id}`)]).then(
      ([allJobs, vendorReviews, recs]) => {
        if (controller.signal.aborted) return
        setLists({
          id,
          jobs: allJobs.filter((job) => vendorUserId && job.posted_by === vendorUserId),
          reviews: vendorReviews,
          recommendations: recs,
        })
      },
    )
    return () => controller.abort()
  }, [loaded, vendorUserId, id, token])

  const handleContactVendor = async () => {
    if (contacting) return
    if (!vendor?.user_id) {
      toast.error('This vendor is not set up for direct messaging yet.')
      return
    }
    if (vendor.user_id === user?.id) {
      toast.error("You can't message yourself.")
      return
    }
    setContacting(true)
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: vendor.user_id,
          message: `Hi ${vendor.company_name}, I'd like to connect about your services.`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not start conversation.')
        return
      }
      navigate(`${MESSAGES_PATH}?conversation=${data.conversationId}`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setContacting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      toast.error('Please select a rating')
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewee_id: vendor.user_id || user.id, // vendor reviews need a reviewee
          vendor_id: parseInt(id, 10),
          rating: reviewRating,
          text: reviewText,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to submit review')
        return
      }
      toast.success('Review submitted!')
      setReviewOpen(false)
      setReviewRating(0)
      setReviewText('')
      const [reviewsRes, vendorRes] = await Promise.all([
        fetch(`/api/reviews/vendor/${id}`, { headers: auth }),
        fetch(`/api/vendors/${id}`, { headers: auth }),
      ])
      if (reviewsRes.ok) {
        const next = listOf(await reviewsRes.json())
        setLists((prev) => (prev.id === id ? { ...prev, reviews: next } : prev))
      }
      if (vendorRes.ok) setFresh({ id, vendor: await vendorRes.json() })
    } catch {
      toast.error('Network error')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <DetailSkeleton label="Loading vendor" />
  if (error) return <DetailError title="We couldn't load this vendor" onRetry={retry} {...BACK} />
  if (notFound || !vendor) return <DetailNotFound title="Vendor not found" {...BACK} />

  const websiteHref = isHttpUrl(vendor.website) ? vendor.website : null
  const categories = vendor.categories || []
  const reviewCount = Number(vendor.reviews_count) || 0

  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailTopBar {...BACK} onShare={() => setShareOpen(true)} />
      <DetailLayout
        asideLabel="Vendor info"
        asideWidth="lg:w-72"
        comments={<CommentThread {...comments} />}
        main={
          <>
            <Card as="article" aria-labelledby="vendor-title" padding="lg" className="flex flex-col gap-ds-md">
              <div className="flex items-start gap-ds-md">
                <CompanyLogo name={vendor.company_name} size="lg" />
                <div className="flex min-w-0 flex-col gap-ds-xxs">
                  <Heading id="vendor-title" level={2} size="h3" className="break-words">
                    {vendor.company_name}
                  </Heading>
                  <div className="flex flex-wrap items-center gap-x-ds-md gap-y-ds-xxs">
                    <span className="inline-flex items-center gap-ds-xs">
                      <StarRating value={vendor.rating} />
                      <Caption>{`${vendor.rating ?? 0} (${reviewsLabel(reviewCount)})`}</Caption>
                    </span>
                    <MetaList items={[{ key: 'location', icon: MapPin, label: vendor.location }]} />
                  </div>
                </div>
              </div>
              {vendor.description && (
                <Text size="body-sm" tone="secondary">
                  {vendor.description}
                </Text>
              )}
              {categories.length > 0 && (
                <ul className="flex flex-wrap gap-ds-xs">
                  {categories.map((category) => (
                    <li key={category}>
                      <Badge tone="info">{category}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {jobs.length > 0 && (
              <DetailSection title={`Jobs by ${vendor.company_name}`}>
                <JobLinkList
                  label={`Jobs by ${vendor.company_name}`}
                  jobs={jobs}
                  to={(job) => `${JOBS_PATH}/${job.id}`}
                  meta={(job) => [job.location, job.type, job.salary_range].filter(Boolean).join(' · ')}
                  badge={(job) => job.category && <Badge size="sm" tone="brand">{job.category}</Badge>}
                />
              </DetailSection>
            )}

            <DetailSection
              title={`Reviews (${reviews.length})`}
              actions={
                <Button size="sm" onClick={() => setReviewOpen(true)}>
                  Write a Review
                </Button>
              }
            >
              {reviews.length === 0 ? (
                <Text size="body-sm" tone="secondary">
                  No reviews yet. Be the first to review!
                </Text>
              ) : (
                <ul className="flex flex-col gap-ds-sm">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard {...reviewCardProps(review)} />
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>

            {recommendations.length > 0 && (
              <DetailSection title="Recommendations">
                <ul className="flex flex-col gap-ds-sm">
                  {recommendations.map((rec) => (
                    <li key={rec.id}>
                      <RecommendationCard {...recommendationCardProps(rec)} />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </>
        }
        aside={
          <>
            <Card padding="lg" className="flex flex-col gap-ds-sm">
              <Button
                block
                leadingIcon={MessageCircle}
                loading={contacting}
                disabled={!vendor.user_id}
                onClick={handleContactVendor}
              >
                Contact Vendor
              </Button>
              {!vendor.user_id && <Caption className="text-center">Direct messages aren't set up for this vendor yet.</Caption>}
              {websiteHref && (
                <Button variant="outline" block leadingIcon={Globe} href={websiteHref}>
                  Visit Website
                </Button>
              )}
            </Card>
            <DetailSection title="Details">
              <DescriptionList
                items={[
                  { key: 'rating', label: 'Rating', value: String(vendor.rating ?? 0) },
                  { key: 'reviews', label: 'Reviews', value: String(reviewCount) },
                  { key: 'location', label: 'Location', value: vendor.location },
                  { key: 'jobs', label: 'Open Jobs', value: String(jobs.length) },
                ]}
              />
            </DetailSection>
          </>
        }
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`Share ${vendor.company_name}`}
        shareTitle={vendor.company_name}
      />

      <Dialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title={`Review ${vendor.company_name}`}
        footer={
          <>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button loading={submittingReview} disabled={!reviewRating} onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-ds-md">
          <StarRating value={reviewRating} onChange={setReviewRating} label="Rating" showLabel />
          <FormField label="Your Review">
            <Textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={4}
              placeholder="Share your experience with this vendor..."
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
