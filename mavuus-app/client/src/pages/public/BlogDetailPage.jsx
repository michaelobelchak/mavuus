import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import AnimatedSection from '../../components/ui/AnimatedSection'
import ScrollProgress from '../../components/ui/ScrollProgress'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return 'Recently published'
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return 'Recently published'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'Recently published'
  }
}

function renderBody(content) {
  if (!content) return null
  const blocks = content.split(/\n{2,}/)
  return blocks.map((block, i) => {
    const h2 = block.match(/^##\s+(.+)$/)
    if (h2) {
      return (
        <h2 key={i} className="text-[20px] md:text-[24px] leading-[1.3] font-semibold text-dark-blue mb-4 mt-8">
          {h2[1]}
        </h2>
      )
    }
    const h3 = block.match(/^###\s+(.+)$/)
    if (h3) {
      return (
        <h3 key={i} className="text-[18px] md:text-[20px] leading-[1.3] font-semibold text-dark-blue mb-3 mt-6">
          {h3[1]}
        </h3>
      )
    }
    if (/^- /m.test(block)) {
      const items = block.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="list-disc pl-6 mb-4 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="text-[15px] md:text-[16px] leading-[1.7] text-[#5E697C]">
              {item.replace(/^- /, '')}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="text-[15px] md:text-[16px] leading-[1.8] text-[#5E697C] mb-4">
        {block}
      </p>
    )
  })
}

export default function BlogDetailPage() {
  const { id } = useParams()
  const [state, setState] = useState({ id: null, article: null, siblings: [], loading: true, notFound: false })
  const { article, siblings, loading, notFound } = state

  // Reset to loading whenever the article id changes
  if (state.id !== id) {
    setState({ id, article: null, siblings: [], loading: true, notFound: false })
  }

  useEffect(() => {
    let active = true
    Promise.all([
      fetch(`/api/resources/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/resources?limit=20`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([item, list]) => {
        if (!active) return
        if (!item) {
          setState({ id, article: null, siblings: [], loading: false, notFound: true })
        } else {
          setState({ id, article: item, siblings: Array.isArray(list) ? list : [], loading: false, notFound: false })
        }
      })
      .catch(() => {
        if (active) setState({ id, article: null, siblings: [], loading: false, notFound: true })
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="text-center py-32 px-6">
        <h1 className="text-2xl font-semibold text-dark-blue mb-3">Article not found</h1>
        <Link to="/articles" className="text-brand-pink hover:underline">
          Back to articles
        </Link>
      </div>
    )
  }

  const currentIndex = siblings.findIndex((s) => s.id === article.id)
  const prevArticle = currentIndex > 0 ? siblings[currentIndex - 1] : null
  const nextArticle = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null
  const sidebarArticles = siblings.filter((s) => s.id !== article.id).slice(0, 5)

  return (
    <div>
      <ScrollProgress />
      <section className="px-6 md:px-12 lg:px-[104px] pt-[74px] pb-6">
        <AnimatedSection animation="fade-up">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Articles', path: '/articles' },
              { label: article.title },
            ]}
          />
        </AnimatedSection>
      </section>

      <div className="w-full h-[2px] bg-neutral-200 opacity-50" />

      <section className="px-6 md:px-12 lg:px-[104px] pt-14 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="flex-1 min-w-0">
            <AnimatedSection animation="fade-up">
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-[1.1] font-semibold text-dark-blue mb-8">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold">
                  {(article.author || 'M').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#5E697C]">By</span>
                    <span className="text-[14px] font-semibold text-dark-blue">
                      {article.author || 'Mavuus Team'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5E697C] capitalize">{article.type || 'article'}</p>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-[#5E697C] ml-auto">
                  {article.read_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{article.read_time}</span>
                    </div>
                  )}
                  <span>{formatDate(article.created_at)}</span>
                </div>
              </div>

              {article.thumbnail_url && (
                <div className="w-full h-[240px] md:h-[340px] lg:h-[400px] rounded-[20px] overflow-hidden mb-12 bg-neutral-100">
                  <img
                    src={article.thumbnail_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {article.description && (
                <p className="text-[17px] md:text-[18px] leading-[1.7] text-dark-blue font-medium mb-8">
                  {article.description}
                </p>
              )}

              <div className="flex flex-col">{renderBody(article.content)}</div>

              <div className="mt-16 pt-8 border-t border-neutral-200">
                <h3 className="text-[20px] font-semibold text-dark-blue mb-6">Share Article</h3>
                <div className="flex gap-4">
                  {['Facebook', 'Twitter', 'LinkedIn', 'Link'].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => {
                        if (platform === 'Link') {
                          navigator.clipboard?.writeText(window.location.href)
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center text-[#5E697C] hover:bg-brand-pink hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      <span className="text-xs font-semibold">{platform[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(prevArticle || nextArticle) && (
                <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {prevArticle ? (
                    <Link
                      to={`/articles/${prevArticle.id}`}
                      className="flex-1 flex items-center gap-4 p-5 md:p-6 bg-bg-light rounded-[16px] hover:bg-neutral-100 transition-colors group"
                    >
                      <ArrowLeft size={20} className="text-[#5E697C] group-hover:text-dark-blue transition-colors flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#5E697C] mb-1">Previous Article</p>
                        <p className="text-[14px] font-semibold text-dark-blue line-clamp-1">
                          {prevArticle.title}
                        </p>
                      </div>
                    </Link>
                  ) : <div className="flex-1" />}
                  {nextArticle ? (
                    <Link
                      to={`/articles/${nextArticle.id}`}
                      className="flex-1 flex items-center justify-end gap-4 p-5 md:p-6 bg-bg-light rounded-[16px] hover:bg-neutral-100 transition-colors group text-right"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#5E697C] mb-1">Next Article</p>
                        <p className="text-[14px] font-semibold text-dark-blue line-clamp-1">
                          {nextArticle.title}
                        </p>
                      </div>
                      <ArrowRight size={20} className="text-[#5E697C] group-hover:text-dark-blue transition-colors flex-shrink-0" />
                    </Link>
                  ) : <div className="flex-1" />}
                </div>
              )}
            </AnimatedSection>
          </div>

          <div className="w-full lg:w-[315px] flex-shrink-0">
            <AnimatedSection animation="fade-left" delay={200}>
              <h3 className="text-[20px] font-semibold text-dark-blue mb-6">Other Articles</h3>
              <div className="flex flex-col gap-6">
                {sidebarArticles.map((item) => (
                  <Link
                    key={item.id}
                    to={`/articles/${item.id}`}
                    className="flex gap-4 group"
                  >
                    <div className="w-[100px] h-[80px] rounded-[12px] overflow-hidden flex-shrink-0 bg-neutral-100">
                      {item.thumbnail_url && (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-[14px] leading-[1.4] font-semibold text-dark-blue group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-[#5E697C] mt-1">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
