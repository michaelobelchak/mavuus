import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router-dom'
import CTABand from '../../components/live/CTABand'
import PageHero from '../../components/live/info/PageHero'
import CategoryLayout from '../../components/live/info/CategoryLayout'
import FaqAccordion from '../../components/live/info/FaqAccordion'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import { cardClass } from '../../components/live/ui/cardStyles'
import { BODY, H_CARD } from '../../components/live/ui/Typography'
import { FAQ_ICON, FAQ_CARD_ORDER, FAQ_SIDEBAR_ORDER, FAQ_CATEGORIES } from '../../data/live/faq'

const SIDEBAR_ITEMS = FAQ_SIDEBAR_ORDER.map((slug) => ({
  slug,
  to: `/faq/${slug}`,
  label: FAQ_CATEGORIES[slug].title,
}))

function CategoryGrid() {
  return (
    <Section>
      <ul className="m-0 grid list-none grid-cols-4 gap-6 p-0 max-[1199px]:grid-cols-2 max-[479px]:grid-cols-1">
        {FAQ_CARD_ORDER.map((slug, i) => {
          const category = FAQ_CATEGORIES[slug]
          return (
            <Reveal as="li" key={slug} index={i} className="flex">
              <Link
                to={`/faq/${slug}`}
                className={cardClass({
                  variant: 'surface',
                  interactive: true,
                  className: 'group flex w-full flex-col items-center gap-4 p-8 text-center no-underline max-[767px]:p-6',
                })}
              >
                <img
                  src={FAQ_ICON}
                  alt=""
                  loading="lazy"
                  className="size-16 p-4 transition-transform duration-300 ease-[var(--ease-live)] group-hover:scale-110 motion-reduce:group-hover:scale-100"
                />
                <h2 className={`m-0 ${H_CARD}`}>{category.title}</h2>
                <p className={`m-0 ${BODY}`}>{category.description}</p>
              </Link>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}

function CategoryDetail({ category }) {
  return (
    <CategoryLayout items={SIDEBAR_ITEMS} current={category.slug} heading={category.heading}>
      <div className="border-t border-live-hairline">
        {category.items.map((item) => (
          <FaqAccordion key={item.q} question={item.q} answer={item.a} />
        ))}
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
      <PageHero title="How We Can Help You?" lead="Frequently Asked Questions" />
      {category ? <CategoryDetail key={category.slug} category={category} /> : <CategoryGrid />}
      <CTABand />
    </>
  )
}
