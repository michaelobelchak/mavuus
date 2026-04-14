import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Breadcrumbs - Navigation breadcrumb trail
 * Matches Figma design: Home › Resources › [Page]
 *
 * @param {Object} props
 * @param {Array<{label: string, path?: string}>} props.items - Breadcrumb items
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap gap-1.5 items-center text-sm text-neutral-500"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <ChevronRight
                size={14}
                className="text-neutral-300 flex-shrink-0"
                aria-hidden
              />
            )}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="relative text-neutral-500 hover:text-brand-pink transition-colors truncate max-w-[220px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={`truncate max-w-[320px] ${
                  isLast ? 'text-dark-blue font-semibold' : 'text-neutral-500'
                }`}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
