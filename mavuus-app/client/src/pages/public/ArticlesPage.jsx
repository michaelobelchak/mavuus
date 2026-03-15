import { articles } from '../../data/mockData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Clock, Tag } from 'lucide-react'

/**
 * Group articles by date string and return sorted groups (newest first).
 */
function groupByDate(items) {
  const groups = {}
  items.forEach(item => {
    if (!groups[item.date]) groups[item.date] = []
    groups[item.date].push(item)
  })
  return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
}

function formatDate(dateStr) {
  // Parse YYYY-MM-DD directly to avoid timezone offset issues
  const [, m, d] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return {
    day: String(d).padStart(2, '0'),
    month: months[m - 1],
  }
}

export default function ArticlesPage() {
  const grouped = groupByDate(articles)

  return (
    <div>
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-[74px] pb-6">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col gap-2.5">
            <Breadcrumbs
              items={[
                { label: 'Home', path: '/' },
                { label: 'Resources', path: '/resources' },
                { label: 'Articles' },
              ]}
            />
            <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-[1.1] text-dark-blue">
              Articles
            </h1>
          </div>
        </AnimatedSection>
      </section>

      {/* Divider */}
      <div className="w-full h-[2px] bg-neutral-200 opacity-50" />

      {/* Content */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-20 pb-40">
        <div className="flex flex-col gap-24">
          {grouped.map(([date, items], groupIdx) => {
            const { day, month } = formatDate(date)
            return (
              <AnimatedSection
                key={date}
                animation="fade-up"
                delay={groupIdx * 100}
              >
                {/* Date group */}
                <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-0 lg:justify-between w-full max-w-[1232px]">
                  {/* Date column */}
                  <div className="flex gap-2.5 items-start justify-center shrink-0">
                    <span className="text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1] text-dark-blue">
                      {day}
                    </span>
                    <span className="text-[22px] leading-[1.3] font-medium text-dark-blue capitalize">
                      {month}
                    </span>
                  </div>

                  {/* Articles column */}
                  <div className="flex flex-col gap-14 w-full lg:w-[950px]">
                    {items.map((article, i) => (
                      <div key={article.id}>
                        {/* Article card */}
                        <div className="flex flex-col-reverse lg:flex-row items-start lg:justify-between gap-6 lg:gap-0 lg:h-[200px] w-full lg:w-[950px] group cursor-pointer">
                          {/* Text */}
                          <div className="flex flex-col justify-between h-full w-full lg:w-[496px]">
                            <div className="flex flex-col gap-6">
                              {/* Meta */}
                              <div className="flex gap-6 items-start">
                                <div className="flex gap-2 items-center">
                                  <Clock size={16} className="text-[#5E697C]" />
                                  <span className="text-[12px] leading-[1.6] text-[#5E697C]">
                                    {article.readTime}
                                  </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Tag size={16} className="text-[#5E697C]" />
                                  <span className="text-[12px] leading-[1.6] text-[#5E697C]">
                                    {article.category}
                                  </span>
                                </div>
                              </div>
                              {/* Title */}
                              <h3 className="text-[24px] leading-[1.3] font-semibold text-dark-blue group-hover:text-brand-blue transition-colors duration-300">
                                {article.title}
                              </h3>
                            </div>
                            {/* Author */}
                            <div className="flex gap-2 items-start text-[16px] leading-[1.6]">
                              <span className="text-[#5E697C]">By</span>
                              <span className="text-dark-blue">
                                {article.author}
                              </span>
                            </div>
                          </div>

                          {/* Image */}
                          <div className="w-full lg:w-[315px] h-[200px] rounded-[16px] overflow-hidden shrink-0">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>

                        {/* Inner divider (between articles in same date group) */}
                        {i < items.length - 1 && (
                          <div className="w-full h-[2px] bg-neutral-200 opacity-50 mt-14" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group divider */}
                {groupIdx < grouped.length - 1 && (
                  <div className="w-full max-w-[1232px] h-[2px] bg-neutral-200 opacity-50 mt-24" />
                )}
              </AnimatedSection>
            )
          })}
        </div>
      </section>
    </div>
  )
}
