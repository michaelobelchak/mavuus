import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'

/** Static blog post content for the detail page demo */
const blogPost = {
  title: 'The Evolving Role of Data in Marketing Strategies',
  author: 'Elmira Abushayeva',
  authorTitle: 'Marketing Strategist, Founder of Mavuus.',
  authorAvatar: '/assets/people/leah-andrew.jpg',
  readTime: '8 min read',
  date: '2026-02-21',
  heroImage: '/assets/blog/blog-hero.jpg',
  sections: [
    {
      title: 'Predictive Analytics and Market Forecasting',
      content: `The integration of predictive analytics into marketing has opened up a new frontier for businesses. By analyzing historical data and identifying patterns, companies can now forecast future market trends with a higher degree of accuracy. This means that marketing strategies can be proactive rather than reactive, giving businesses a competitive edge.\n\nPredictive analytics allows marketers to anticipate customer needs and preferences, enabling them to tailor their campaigns for maximum impact. It's not just about understanding what customers have done in the past; it's about predicting what they will do in the future and preparing for it. This data-driven foresight is reshaping how companies approach their marketing strategies, making them more agile, responsive, and effective.`,
    },
    {
      title: 'Customization and Personalization',
      content: `In the age of data, customization and personalization have become key differentiators in marketing. Consumers expect experiences that are tailored to their individual needs and preferences. Data enables marketers to deliver on these expectations by providing insights into customer behavior, preferences, and purchase history.\n\nPersonalized marketing isn't just about addressing customers by their first name in an email. It's about creating a unique experience for each individual across all touchpoints. From personalized product recommendations to customized content, data-driven personalization can significantly enhance customer engagement and loyalty.`,
    },
    {
      title: 'The Ethical Consideration of Data Usage',
      content: `As the use of data in marketing grows, so do the ethical considerations around its collection and use. Consumers are increasingly aware of how their data is being used and are demanding more transparency and control. This has led to the implementation of regulations like GDPR and CCPA, which set strict guidelines for data collection and usage.\n\nMarketers must navigate these regulations while still leveraging data to drive their strategies. This means adopting practices that prioritize data privacy and security, such as obtaining explicit consent for data collection, anonymizing data, and being transparent about how data is used. Ethical data practices not only ensure compliance but also build trust with consumers, which is invaluable in today's digital landscape.`,
    },
    {
      title: 'The Future of Data-Driven Marketing',
      content: `The future of data-driven marketing is incredibly promising. With advancements in AI and machine learning, the ability to analyze and leverage data will only grow more sophisticated. This will enable even more precise targeting, personalization, and prediction, further transforming the marketing landscape.\n\nHowever, the future also brings challenges. As data becomes more central to marketing strategies, the need for skilled data analysts and scientists will increase. Companies will need to invest in talent and technology to stay competitive. Additionally, the evolving regulatory landscape will require marketers to stay agile and adapt their practices to comply with new data privacy laws.`,
    },
  ],
}

/** Sidebar articles */
const sidebarArticles = [
  {
    id: 1,
    title: 'Sustainable Branding: Marketing in the Age of Awareness',
    date: '2026-03-02',
    image: '/assets/blog/blog-sidebar-1.jpg',
  },
  {
    id: 2,
    title: 'SEO Strategies for Voice Search Optimization in 2024',
    date: '2026-02-21',
    image: '/assets/blog/blog-sidebar-2.jpg',
  },
  {
    id: 3,
    title: 'The Rise of Video Content in B2B Marketing',
    date: '2026-02-21',
    image: '/assets/blog/blog-sidebar-1.jpg',
  },
  {
    id: 4,
    title: '5 Key Trends Shaping Content Marketing in 2024',
    date: '2026-01-16',
    image: '/assets/blog/blog-sidebar-2.jpg',
  },
]

/** Bottom events section */
const blogEvents = [
  {
    id: 1,
    title: 'Marketing To Women In B2B: How To Appeal To a Female Demographic In 2024',
    image: '/assets/blog/blog-event-1.jpg',
  },
  {
    id: 2,
    title: 'Storytelling In B2B Marketing Crafting Narratives That Captivate Professionals',
    image: '/assets/blog/blog-event-2.jpg',
  },
  {
    id: 3,
    title: 'Sustainability As A Marketing Strategy: Positioning Your Brand For The Eco-Conscious Consumer',
    image: '/assets/blog/blog-event-3.jpg',
  },
]

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

export default function BlogDetailPage() {
  return (
    <div>
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-[74px] pb-6">
        <AnimatedSection animation="fade-up">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Resources', path: '/resources' },
              { label: blogPost.title },
            ]}
          />
        </AnimatedSection>
      </section>

      {/* Divider */}
      <div className="w-full h-[2px] bg-neutral-200 opacity-50" />

      {/* Content */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-14 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatedSection animation="fade-up">
              {/* Title */}
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-[1.1] font-semibold text-dark-blue mb-8">
                {blogPost.title}
              </h1>

              {/* Author info */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <img
                  src={blogPost.authorAvatar}
                  alt={blogPost.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#5E697C]">By</span>
                    <span className="text-[14px] font-semibold text-dark-blue">{blogPost.author}</span>
                  </div>
                  <p className="text-[12px] text-[#5E697C]">{blogPost.authorTitle}</p>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-[#5E697C] ml-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{blogPost.readTime}</span>
                  </div>
                  <span>{formatDate(blogPost.date)}</span>
                </div>
              </div>

              {/* Hero image */}
              <div className="w-full h-[240px] md:h-[340px] lg:h-[400px] rounded-[20px] overflow-hidden mb-12">
                <img
                  src={blogPost.heroImage}
                  alt={blogPost.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article body */}
              <div className="flex flex-col gap-10">
                {blogPost.sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="text-[20px] md:text-[24px] leading-[1.3] font-semibold text-dark-blue mb-4">
                      {section.title}
                    </h2>
                    {section.content.split('\n\n').map((para, j) => (
                      <p key={j} className="text-[15px] md:text-[16px] leading-[1.8] text-[#5E697C] mb-4">
                        {para}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Share Article */}
              <div className="mt-16 pt-8 border-t border-neutral-200">
                <h3 className="text-[20px] font-semibold text-dark-blue mb-6">Share Article</h3>
                <div className="flex gap-4">
                  {['Facebook', 'Instagram', 'TikTok', 'Twitter'].map((platform) => (
                    <a
                      key={platform}
                      href="#"
                      className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center text-[#5E697C] hover:bg-brand-pink hover:text-white transition-all duration-300"
                    >
                      <span className="text-xs font-semibold">{platform[0]}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Previous / Next Article */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Link
                  to="/articles"
                  className="flex-1 flex items-center gap-4 p-5 md:p-6 bg-bg-light rounded-[16px] hover:bg-neutral-100 transition-colors group"
                >
                  <ArrowLeft size={20} className="text-[#5E697C] group-hover:text-dark-blue transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#5E697C] mb-1">Previous Article</p>
                    <p className="text-[14px] font-semibold text-dark-blue line-clamp-1">
                      Sustainable Branding: Marketing in the Age of Awareness
                    </p>
                  </div>
                </Link>
                <Link
                  to="/articles"
                  className="flex-1 flex items-center justify-end gap-4 p-5 md:p-6 bg-bg-light rounded-[16px] hover:bg-neutral-100 transition-colors group text-right"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#5E697C] mb-1">Next Article</p>
                    <p className="text-[14px] font-semibold text-dark-blue line-clamp-1">
                      SEO Strategies for Voice Search Optimization
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-[#5E697C] group-hover:text-dark-blue transition-colors flex-shrink-0" />
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[315px] flex-shrink-0">
            <AnimatedSection animation="fade-left" delay={200}>
              <h3 className="text-[20px] font-semibold text-dark-blue mb-6">Other Articles</h3>
              <div className="flex flex-col gap-6">
                {sidebarArticles.map((article) => (
                  <Link
                    key={article.id}
                    to="/articles"
                    className="flex gap-4 group"
                  >
                    <div className="w-[100px] h-[80px] rounded-[12px] overflow-hidden flex-shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-[14px] leading-[1.4] font-semibold text-dark-blue group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-[12px] text-[#5E697C] mt-1">
                        {formatDate(article.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Upcoming Live Events */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20 bg-bg-light">
        <AnimatedSection animation="fade-up">
          <h2 className="text-[24px] md:text-[32px] leading-[1.3] font-semibold text-dark-blue mb-10">
            View Our Upcoming Live Events
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogEvents.map((event, i) => (
            <AnimatedSection key={event.id} animation="fade-up" delay={i * 100}>
              <Link to="/events" className="group cursor-pointer block">
                <div className="w-full h-[220px] rounded-[16px] overflow-hidden mb-4">
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-[16px] md:text-[18px] leading-[1.3] font-semibold text-dark-blue group-hover:text-brand-blue transition-colors duration-300">
                  {event.title}
                </h3>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  )
}
