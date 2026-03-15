import { Star } from 'lucide-react'
import { useState } from 'react'

export default function StarRating({ rating = 0, onChange, size = 18, readonly = false }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= Math.round(rating) : star <= (hovered || rating)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
          >
            <Star
              size={size}
              className={filled ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
            />
          </button>
        )
      })}
    </div>
  )
}
