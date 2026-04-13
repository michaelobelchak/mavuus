import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DetailPageHeader from '../../components/ui/DetailPageHeader'
import ShareModal from '../../components/ui/ShareModal'
import ScrollProgress from '../../components/ui/ScrollProgress'
import {
  Clock,
  User,
  Download,
  FileText,
} from 'lucide-react'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`/api/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setResource(await res.json())
      } catch {
        // Network error
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Resource not found</p>
        <button
          onClick={() => navigate('/dashboard/resources')}
          className="text-brand-pink hover:underline mt-2 inline-block cursor-pointer"
        >
          Back to Resources
        </button>
      </div>
    )
  }

  // Simple markdown-like rendering: ## headings, **bold**, bullet lists
  const renderContent = (text) => {
    if (!text) return null
    return text.split('\n\n').map((block, i) => {
      const trimmed = block.trim()
      if (!trimmed) return null

      // ## Heading
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold text-dark-blue mt-8 mb-3">
            {trimmed.slice(3)}
          </h2>
        )
      }
      // ### Subheading
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-semibold text-dark-blue mt-6 mb-2">
            {trimmed.slice(4)}
          </h3>
        )
      }
      // Bullet list block
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(l => l.trim().startsWith('- '))
        return (
          <ul key={i} className="list-disc list-inside space-y-1 mb-4 text-neutral-600">
            {items.map((item, j) => {
              const text = item.trim().slice(2)
              // Handle **bold** within list items
              const parts = text.split(/\*\*(.*?)\*\*/)
              return (
                <li key={j} className="text-sm leading-relaxed">
                  {parts.map((part, k) =>
                    k % 2 === 1 ? <strong key={k} className="text-dark-blue">{part}</strong> : part
                  )}
                </li>
              )
            })}
          </ul>
        )
      }
      // Numbered list block
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').filter(l => /^\d+\.\s/.test(l.trim()))
        return (
          <ol key={i} className="list-decimal list-inside space-y-1 mb-4 text-neutral-600">
            {items.map((item, j) => (
              <li key={j} className="text-sm leading-relaxed">
                {item.trim().replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        )
      }
      // Regular paragraph — handle **bold**
      const parts = trimmed.split(/\*\*(.*?)\*\*/)
      return (
        <p key={i} className="text-sm text-neutral-600 leading-relaxed mb-4">
          {parts.map((part, k) =>
            k % 2 === 1 ? <strong key={k} className="text-dark-blue">{part}</strong> : part
          )}
        </p>
      )
    })
  }

  const isDownloadable = resource.type === 'template'

  return (
    <div className="max-w-6xl">
      <ScrollProgress />
      <DetailPageHeader onShare={() => setShareOpen(true)} />

      {/* Hero image */}
      {resource.thumbnail_url && (
        <div className="h-64 rounded-2xl overflow-hidden mb-6">
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-neutral-100 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="gray">{resource.category}</Badge>
              <Badge variant="blue">{resource.type}</Badge>
            </div>

            <h1 className="text-2xl font-bold text-dark-blue mb-3">
              {resource.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-6 pb-6 border-b border-neutral-100">
              <span className="flex items-center gap-1">
                <User size={14} />
                {resource.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {resource.read_time}
              </span>
            </div>

            {/* Article body */}
            {resource.content ? (
              <div className="prose-content">
                {renderContent(resource.content)}
              </div>
            ) : (
              <p className="text-sm text-neutral-600 leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Download / CTA card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            {isDownloadable ? (
              <>
                <Button className="w-full mb-2">
                  <Download size={16} /> Download Template
                </Button>
                <p className="text-xs text-neutral-500 text-center">
                  Free for all members
                </p>
              </>
            ) : (
              <>
                <Button className="w-full mb-2">
                  <FileText size={16} /> Save to Library
                </Button>
                <p className="text-xs text-neutral-500 text-center">
                  Bookmark for later
                </p>
              </>
            )}
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold text-dark-blue mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Author</span>
                <span className="text-dark-blue font-medium">{resource.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Type</span>
                <span className="text-dark-blue font-medium capitalize">{resource.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Category</span>
                <span className="text-dark-blue font-medium">{resource.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Read Time</span>
                <span className="text-dark-blue font-medium">{resource.read_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`Share ${resource.title}`}
        shareTitle={resource.title}
      />
    </div>
  )
}
