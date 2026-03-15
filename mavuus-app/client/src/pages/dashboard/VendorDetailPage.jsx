import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
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
  const { token } = useAuth()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, jobsRes] = await Promise.all([
          fetch(`/api/vendors/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/jobs', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (vendorRes.ok) {
          const v = await vendorRes.json()
          setVendor(v)
          // Filter jobs by vendor company name
          if (jobsRes.ok) {
            const allJobs = await jobsRes.json()
            setJobs(allJobs.filter(j =>
              j.company.toLowerCase() === v.company_name.toLowerCase()
            ))
          }
        }
      } catch {
        // Network error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, token])

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
                        ({vendor.reviews_count} reviews)
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
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <Button className="w-full mb-3">
              <MessageCircle size={16} /> Contact Vendor
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
    </div>
  )
}
