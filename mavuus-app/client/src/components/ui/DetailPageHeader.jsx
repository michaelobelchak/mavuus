import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2 } from 'lucide-react'

/**
 * Shared header for dashboard detail pages — back button + optional share trigger.
 * Used by SessionDetail / JobDetail / ResourceDetail / VendorDetail / MemberProfile.
 */
export default function DetailPageHeader({
  onShare,
  backLabel = 'Back',
  className = '',
}) {
  const navigate = useNavigate()
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> {backLabel}
      </button>
      {onShare && (
        <button
          onClick={onShare}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-pink transition-colors cursor-pointer"
        >
          <Share2 size={16} /> Share
        </button>
      )}
    </div>
  )
}
