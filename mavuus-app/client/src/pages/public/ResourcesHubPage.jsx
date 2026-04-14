import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  featuredArticle,
  resourceEvents,
  resourceVideos,
  articles as mockArticles,
  liveEvents,
} from '../../data/mockData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Clock, Tag, ArrowRight, Play } from 'lucide-react'

export default function ResourcesHubPage() {
  const [apiArticles, setApiArticles] = useState([])

  useEffect(() => {
    let active = true
    fetch('/api/resources?limit=6')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setApiArticles(data)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Prefer live API articles; fall back to mock data if fetch empty
  const articles = apiArticles.length > 0
    ? apiArticles.map((a) => ({
        id: a.id,
        title: a.title,
        image: a.thumbnail_url || '/assets/blog/blog-sidebar-1.jpg',
        author: a.author || 'Mavuus Team',
        readTime: a.read_time || '5 min read',
        category: a.category || 'Guide',
      }))
    : mockArticles

  return (
    <div>
      <Helmet>
        <title>Mavuus Resources Hub</title>
        <meta name="description" content="Explore Mavuus resources including articles, live events, and on-demand videos for marketing leaders." />
        <link rel="canonical" href="https://mavuus.com/resources" />
      </Helmet>

      {/* Header + Featured Article */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-[74px] pb-14">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col gap-2.5 mb-10">
            <Breadcrumbs
              items={[
                { label: 'Home', path: '/' },
                { label: 'Resources' },
              ]}
            />
            <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-[1.1] text-dark-blue">
              Helpful Resources
            </h1>
          </div>
        </AnimatedSection>

        {/* Featured Article Card */}
        <AnimatedSection animation="scale-up" delay={100}>
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10 bg-white rounded-[24px] overflow-hidden shadow-[0px_8px_18px_rgba(0,0,0,0.03)]">
            {/* Image */}
            <div className="w-full lg:w-[500px] h-[240px] md:h-[300px] lg:h-[340px] shrink-0 overflow-hidden rounded-[24px]">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between py-6 px-6 lg:px-0 lg:pr-8 flex-1">
              <div className="flex flex-col gap-5">
                {/* Meta */}
                <div className="flex gap-6 items-center">
                  <div className="flex gap-2 items-center">
                    <Clock size={16} className="text-[#5E697C]" />
                    <span className="text-[12px] leading-[1.6] text-[#5E697C]">
                      {featuredArticle.readTime}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Tag size={16} className="text-[#5E697C]" />
                    <span className="text-[12px] leading-[1.6] text-[#5E697C]">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] font-semibold text-dark-blue">
                  {featuredArticle.title}
                </h2>

                {/* Learn More */}
                <Link
                  to="/articles"
                  className="text-brand-pink font-medium text-[14px] hover:underline inline-flex items-center gap-1"
                >
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>

              {/* Author */}
              <div className="flex gap-3 items-center">
                <img
                  src={featuredArticle.authorAvatar}
                  alt={featuredArticle.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-[14px] font-semibold text-dark-blue">
                    {featuredArticle.author}
                  </p>
                  <p className="text-[12px] text-[#5E697C]">
                    {featuredArticle.authorTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Live Events Section */}
      <section className="px-6 md:px-12 lg:px-[104px] py-14">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-10">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] font-semibold text-dark-blue">
              Live Events
            </h2>
            <Link
              to="/events"
              className="flex items-center gap-2 text-[14px] text-[#5E697C] hover:text-dark-blue transition-colors"
            >
              View All{' '}
              <span className="bg-neutral-100 rounded-full px-2 py-0.5 text-[12px] font-medium">
                {liveEvents.length}
              </span>{' '}
              Events <ArrowRight size={14} />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceEvents.map((event, i) => (
            <AnimatedSection key={event.id} animation="fade-up" delay={i * 100}>
              <div className="group cursor-pointer">
                {/* Image */}
                <div className="w-full h-[220px] rounded-[16px] overflow-hidden mb-5">
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Title */}
                <h3 className="text-[18px] leading-[1.3] font-semibold text-dark-blue mb-3 group-hover:text-brand-blue transition-colors duration-300">
                  {event.title}
                </h3>
                {/* Description */}
                <p className="text-[14px] leading-[1.6] text-[#5E697C] mb-4 line-clamp-3">
                  {event.description}
                </p>
                {/* Avatars */}
                <div className="flex -space-x-2">
                  {event.avatars.map((avatar, j) => (
                    <img
                      key={j}
                      src={avatar}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* On Demand Videos Section */}
      <section className="px-6 md:px-12 lg:px-[104px] py-14">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-10">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] font-semibold text-dark-blue">
              On-Demand Videos
            </h2>
            <Link
              to="/dashboard/on-demand"
              className="flex items-center gap-2 text-[14px] text-[#5E697C] hover:text-dark-blue transition-colors"
            >
              View All{' '}
              <span className="bg-neutral-100 rounded-full px-2 py-0.5 text-[12px] font-medium">
                {resourceVideos.length}
              </span>{' '}
              On Demand Videos <ArrowRight size={14} />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceVideos.map((video, i) => (
            <AnimatedSection key={video.id} animation="fade-up" delay={i * 100}>
              <div className="group cursor-pointer">
                {/* Image with play overlay */}
                <div className="relative w-full h-[220px] rounded-[16px] overflow-hidden mb-5">
                  <img
                    src={video.image}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                      <Play size={24} className="text-dark-blue ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                {/* Title */}
                <h3 className="text-[18px] leading-[1.3] font-semibold text-dark-blue mb-4 group-hover:text-brand-blue transition-colors duration-300">
                  {video.title}
                </h3>
                {/* Avatars */}
                <div className="flex -space-x-2">
                  {video.avatars.map((avatar, j) => (
                    <img
                      key={j}
                      src={avatar}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section className="px-6 md:px-12 lg:px-[104px] py-14 pb-24">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-10">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] font-semibold text-dark-blue">
              Articles
            </h2>
            <Link
              to="/articles"
              className="flex items-center gap-2 text-brand-pink text-[14px] font-medium hover:underline"
            >
              View All{' '}
              <span className="bg-pink-50 rounded-full px-2 py-0.5 text-[12px] font-medium text-brand-pink">
                {articles.length > 100 ? '180' : articles.length}
              </span>{' '}
              Articles <ArrowRight size={14} />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles.slice(0, 6).map((article, i) => (
            <AnimatedSection key={article.id} animation="fade-up" delay={i * 80}>
              <Link to={`/articles/${article.id}`} className="group cursor-pointer block">
                {/* Image */}
                <div className="w-full h-[220px] rounded-[16px] overflow-hidden mb-5 bg-neutral-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Meta */}
                <div className="flex gap-4 items-center mb-3">
                  <div className="flex gap-1.5 items-center">
                    <Clock size={14} className="text-[#5E697C]" />
                    <span className="text-[12px] text-[#5E697C]">
                      {article.readTime}
                    </span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <Tag size={14} className="text-[#5E697C]" />
                    <span className="text-[12px] text-[#5E697C]">
                      {article.category}
                    </span>
                  </div>
                </div>
                {/* Title */}
                <h3 className="text-[18px] leading-[1.3] font-semibold text-dark-blue mb-3 group-hover:text-brand-blue transition-colors duration-300">
                  {article.title}
                </h3>
                {/* Author */}
                <p className="text-[14px] text-[#5E697C]">
                  By{' '}
                  <span className="text-dark-blue">{article.author}</span>
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  )
}
