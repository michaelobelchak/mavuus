import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StarRating from '../../components/ui/StarRating'
import ReviewCard from '../../components/ui/ReviewCard'
import RecommendationCard from '../../components/ui/RecommendationCard'
import { Textarea } from '../../components/ui/Input'
import {
  ArrowLeft,
  Star,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  MessageCircle,
} from 'lucide-react'

export default function VendorDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [vendor, setVendor] = useState(null)
  const [jobs, setJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  // Write review modal
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [contactingVendor, setContactingVendor] = useState(false)

  const handleContactVendor = async () => {
    if (contactingVendor) return
    if (!vendor?.user_id) {
      toast.error('This vendor is not set up for direct messaging yet.')
      return
    }
    if (vendor.user_id === user.id) {
      toast.error('You can\'t message yourself.')
      return
    }
    setContactingVendor(true)
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: vendor.user_id,
          message: `Hi ${vendor.company_name} — I'd like to connect about your services.`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not start conversation.')
        return
      }
      navigate(`/dashboard/messages?conversation=${data.conversationId}`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setContactingVendor(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, jobsRes, reviewsRes, recsRes] = await Promise.all([
          fetch(`/api/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/reviews/vendor/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/recommendations/vendor/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (vendorRes.ok) {
          const v = await vendorRes.json()
          setVendor(v)
          if (jobsRes.ok) {
            const allJobs = await jobsRes.json()
            setJobs(allJobs.filter(j =>
              v.user_id && j.posted_by === v.user_id
            ))
          }
        }
        if (reviewsRes.ok) setReviews(await reviewsRes.json())
        if (recsRes.ok) setRecommendations(await recsRes.json())
      } catch {
        // Network error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, token])

  const handleSubmitReview = async () => {
    if (!reviewRating) return toast.error('Please select a rating')
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewee_id: vendor.user_id || user.id, // vendor reviews need a reviewee
          vendor_id: parseInt(id),
          rating: reviewRating,
          text: reviewText,
        }),
      })
      if (res.ok) {
        toast.success('Review submitted!')
        setShowReviewModal(false)
        setReviewRating(0)
        setReviewText('')
        // Refresh reviews and vendor data
        const [reviewsRes, vendorRes] = await Promise.all([
          fetch(`/api/reviews/vendor/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (reviewsRes.ok) setReviews(await reviewsRes.json())
        if (vendorRes.ok) setVendor(await vendorRes.json())
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch { toast.error('Network error') }
    finally { setSubmittingReview(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Vendor not found</p>
        <button
          onClick={() => navigate('/dashboard/vendors')}
          className="text-brand-pink hover:underline mt-2 inline-block cursor-pointer"
        >
          Back to Vendors
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-brand-blue">
                    {vendor.company_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark-blue">
                    {vendor.company_name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star size={14} className="fill-yellow-400" />
                      <span className="font-semibold">{vendor.rating}</span>
                      <span className="text-neutral-400">
                        ({vendor.reviews_count} review{vendor.reviews_count !== 1 ? 's' : ''})
                      </span>
                    </div>
                    {vendor.location && (
                      <span className="flex items-center gap-1 text-sm text-neutral-500">
                        <MapPin size={14} />
                        {vendor.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              {vendor.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {vendor.categories.map(cat => (
                <Badge key={cat} variant="blue">{cat}</Badge>
              ))}
            </div>
          </div>

          {/* Jobs by this vendor */}
          {jobs.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <Briefcase size={18} />
                Jobs by {vendor.company_name}
              </h3>
              <div className="space-y-3">
                {jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    className="w-full text-left p-4 rounded-xl border border-neutral-100 hover:border-brand-pink/30 hover:bg-brand-pink/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-dark-blue">{job.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                          <span>{job.location}</span>
                          <span className="capitalize">{job.type}</span>
                          {job.salary_range && <span>{job.salary_range}</span>}
                        </div>
                      </div>
                      <Badge variant="pink">{job.category}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-blue flex items-center gap-2">
                <Star size={18} /> Reviews ({reviews.length})
              </h3>
              <Button size="sm" onClick={() => setShowReviewModal(true)}>
                Write a Review
              </Button>
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(review => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map(rec => (
                  <RecommendationCard key={rec.id} {...rec} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <Button
              className="w-full mb-3"
              onClick={handleContactVendor}
              disabled={contactingVendor || !vendor.user_id}
            >
              <MessageCircle size={16} /> {contactingVendor ? 'Connecting…' : 'Contact Vendor'}
            </Button>
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <Globe size={14} /> Visit Website <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold text-dark-blue mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Rating</span>
                <span className="text-dark-blue font-medium flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  {vendor.rating}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reviews</span>
                <span className="text-dark-blue font-medium">{vendor.reviews_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Location</span>
                <span className="text-dark-blue font-medium">{vendor.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Open Jobs</span>
                <span className="text-dark-blue font-medium">{jobs.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={`Review ${vendor.company_name}`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark-blue mb-2 block">Rating</label>
            <StarRating rating={reviewRating} onChange={setReviewRating} size={24} />
          </div>
          <Textarea
            label="Your Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Share your experience with this vendor..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview || !reviewRating}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
