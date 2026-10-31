import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router-dom'
import LiveContainer from '../../components/live/LiveContainer'
import CTABand from '../../components/live/CTABand'
import TertiaryHero from '../../components/live/info/TertiaryHero'
import CategoryLayout from '../../components/live/info/CategoryLayout'
import FaqAccordion from '../../components/live/info/FaqAccordion'
import { FAQ_ICON, FAQ_CARD_ORDER, FAQ_SIDEBAR_ORDER, FAQ_CATEGORIES } from '../../data/live/faq'

const SIDEBAR_ITEMS = FAQ_SIDEBAR_ORDER.map((slug) => ({
  slug,
  to: `/faq/${slug}`,
  label: FAQ_CATEGORIES[slug].title,
}))

function CategoryGrid() {
  return (
    <section className="text-dark-blue">
      <LiveContainer innerClassName="py-24">
        <div className="py-16 max-[991px]:py-24">
          <div className="grid grid-cols-4 gap-10 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1 max-[479px]:gap-8">
            {FAQ_CARD_ORDER.map((slug) => {
              const category = FAQ_CATEGORIES[slug]
              return (
                <Link
                  key={slug}
                  to={`/faq/${slug}`}
                  className="group flex max-w-full flex-col items-center justify-center gap-4 rounded-2xl bg-white px-4 pt-8 pb-16 text-center text-black no-underline transition-all duration-200 hover:shadow-[0_2px_18px_5px_#0000000f]"
                >
                  <img
                    src={FAQ_ICON}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 rounded-full border border-white p-4 transition-transform duration-300 group-hover:scale-110"
                  />
                  <h4 className="text-2xl leading-[33.6px] font-medium text-black max-md:text-xl max-md:leading-7">{category.title}</h4>
                  <div className="text-base leading-6">{category.description}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}

function CategoryDetail({ category }) {
  return (
    <CategoryLayout items={SIDEBAR_ITEMS} current={category.slug}>
      <div className="flex flex-col gap-8">
        <h3 className="text-[26px] leading-[33px] font-medium max-md:text-2xl">{category.heading}</h3>
        <div>
          {category.items.map((item) => (
            <FaqAccordion key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </CategoryLayout>
  )
}

export default function FaqPage() {
  const { category: slug } = useParams()
  const category = slug ? FAQ_CATEGORIES[slug] : null
  if (slug && !category) return <Navigate to="/faq" replace />

  return (
    <>
      <Helmet>
        <title>{category ? `${category.title} - Mavuus` : 'FAQs - Mavuus'}</title>
        <meta
          name="description"
          content="Answers to questions on how Mavuus helps CMOs elevate their executive influence by sharing, learning and leading together."
        />
      </Helmet>
      <TertiaryHero title="How We Can Help You?" subtitle="Frequently Asked Questions" />
      {category ? <CategoryDetail key={category.slug} category={category} /> : <CategoryGrid />}
      <CTABand />
    </>
  )
}
