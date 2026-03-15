import { Link } from 'react-router-dom'

/**
 * Breadcrumbs - Navigation breadcrumb trail
 * Matches Figma design: Home / Resources / [Page]
 *
 * @param {Object} props
 * @param {Array<{label: string, path?: string}>} props.items - Breadcrumb items
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex gap-2 items-center text-[16px] leading-[28px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-[#5E697C]">/</span>}
          {item.path ? (
            <Link
              to={item.path}
              className="text-[#5E697C] hover:text-dark-blue transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-dark-blue font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
