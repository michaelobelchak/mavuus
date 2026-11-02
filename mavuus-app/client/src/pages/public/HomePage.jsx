import { Helmet } from 'react-helmet-async'
import HomeHero from '../../components/live/home/HomeHero'
import ForBusinesses from '../../components/live/home/ForBusinesses'
import SeniorExperience from '../../components/live/home/SeniorExperience'
import InsightsSlider from '../../components/live/home/InsightsSlider'
import NetworkSection from '../../components/live/home/NetworkSection'
import LeadersMarquee from '../../components/live/home/LeadersMarquee'
import ForMarketers from '../../components/live/home/ForMarketers'
import ReadyCTA from '../../components/live/home/ReadyCTA'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Mavuus | B2B Marketing Strategy, Execution &amp; Leadership</title>
        <meta
          name="description"
          content="We help B2B companies make smarter marketing decisions and turn strategy into measurable business impact, from positioning and go-to-market planning to demand generation and campaign execution."
        />
        <link rel="canonical" href="https://www.mavuus.com/" />
      </Helmet>
      <HomeHero />
      <ForBusinesses />
      <SeniorExperience />
      <InsightsSlider />
      <NetworkSection />
      <LeadersMarquee />
      <ForMarketers />
      <ReadyCTA />
    </>
  )
}
