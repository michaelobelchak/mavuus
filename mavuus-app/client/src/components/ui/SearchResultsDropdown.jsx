import { Link } from 'react-router-dom'
import { Video, FileText, Users, Store, Briefcase } from 'lucide-react'

const sections = [
  { key: 'sessions', label: 'Sessions', icon: Video, getLink: (item) => `/dashboard/live-sessions/${item.id}`, getName: (item) => item.title, getSub: (item) => item.speaker_name },
  { key: 'resources', label: 'Resources', icon: FileText, getLink: (item) => `/dashboard/resources/${item.id}`, getName: (item) => item.title, getSub: (item) => item.author },
  { key: 'members', label: 'Members', icon: Users, getLink: (item) => `/dashboard/members/${item.id}`, getName: (item) => item.name, getSub: (item) => [item.title, item.company].filter(Boolean).join(' at ') },
  { key: 'vendors', label: 'Vendors', icon: Store, getLink: (item) => `/dashboard/vendors/${item.id}`, getName: (item) => item.company_name, getSub: () => null },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, getLink: (item) => `/dashboard/jobs/${item.id}`, getName: (item) => item.title, getSub: (item) => item.company },
]

export default function SearchResultsDropdown({ results, onClose }) {
  if (!results) return null

  const hasResults = sections.some(s => results[s.key]?.length > 0)

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 z-50">
        <p className="text-sm text-neutral-500 text-center">No results found</p>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
      {sections.map(section => {
        const items = results[section.key]
        if (!items?.length) return null
        const Icon = section.icon

        return (
          <div key={section.key}>
            <div className="px-3 py-1.5 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Icon size={12} />
              {section.label}
            </div>
            {items.map(item => (
              <Link
                key={item.id}
                to={section.getLink(item)}
                onClick={onClose}
                className="block px-3 py-2 hover:bg-neutral-50 transition-colors no-underline"
              >
                <p className="text-sm font-medium text-dark-blue truncate">{section.getName(item)}</p>
                {section.getSub(item) && (
                  <p className="text-xs text-neutral-500 truncate">{section.getSub(item)}</p>
                )}
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}
