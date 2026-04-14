import Avatar from './Avatar'
import Badge from './Badge'

export default function RecommendationCard({ from_name, from_title, from_avatar, message, vendor_name, created_at }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-neutral-100">
      <div className="flex items-start gap-3">
        <Avatar name={from_name} src={from_avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-dark-blue">{from_name}</p>
            {vendor_name && <Badge variant="blue">{vendor_name}</Badge>}
          </div>
          {from_title && <p className="text-xs text-neutral-500">{from_title}</p>}
          {message && (
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{message}</p>
          )}
          <p className="text-xs text-neutral-400 mt-2">
            {new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
