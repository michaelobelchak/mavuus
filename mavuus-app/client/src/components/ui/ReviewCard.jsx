import Avatar from './Avatar'
import StarRating from './StarRating'

export default function ReviewCard({ reviewer_name, reviewer_title, reviewer_avatar, rating, text, created_at, vendor_name }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-neutral-100">
      <div className="flex items-start gap-3">
        <Avatar name={reviewer_name} src={reviewer_avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-dark-blue">{reviewer_name}</p>
              {reviewer_title && <p className="text-xs text-neutral-500">{reviewer_title}</p>}
            </div>
            <StarRating rating={rating} readonly size={14} />
          </div>
          {vendor_name && (
            <p className="text-xs text-brand-pink mt-1">Re: {vendor_name}</p>
          )}
          {text && (
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{text}</p>
          )}
          <p className="text-xs text-neutral-400 mt-2">
            {new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
