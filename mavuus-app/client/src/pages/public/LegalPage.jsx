import { Helmet } from 'react-helmet-async'
import { Navigate, useParams } from 'react-router-dom'
import CTABand from '../../components/live/CTABand'
import PageHero from '../../components/live/info/PageHero'
import CategoryLayout from '../../components/live/info/CategoryLayout'
import RichText from '../../components/live/info/RichText'
import { LEGAL } from '../../data/live/legal'

const BASE_PATH = { terms: '/terms-conditions', privacy: '/privacy-policy' }

export default function LegalPage({ kind = 'terms' }) {
  const { section: slug } = useParams()
  const doc = LEGAL[kind]
  const base = BASE_PATH[kind]
  const section = doc.sections.find((s) => s.slug === slug)
  if (!section) return <Navigate to={`${base}/introduction`} replace />

  const items = doc.sections.map((s) => ({ slug: s.slug, to: `${base}/${s.slug}`, label: s.label }))

  return (
    <>
      <Helmet>
        <title>{`${doc.title} - Mavuus`}</title>
      </Helmet>
      <PageHero title={doc.title} lead={doc.subtitle} />
      <CategoryLayout key={kind} items={items} current={section.slug} heading={section.heading}>
        <RichText html={section.html} />
      </CategoryLayout>
      <CTABand />
    </>
  )
}
