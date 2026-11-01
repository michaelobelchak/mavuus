import CTABand from '../../components/live/CTABand'
import ServicesHero from '../../components/live/services/ServicesHero'
import HowWeHelp from '../../components/live/services/HowWeHelp'
import WaysToWork from '../../components/live/services/WaysToWork'
import WhyMavuus from '../../components/live/services/WhyMavuus'
import Reveal from '../../components/live/ui/Reveal'
import Section from '../../components/live/ui/Section'
import { BODY, Eyebrow, H_SECTION } from '../../components/live/ui/Typography'
import { WHO_IMAGE } from '../../data/live/services'

function WhereWeComeIn() {
  return (
    <Section>
      <div className="grid grid-cols-[1.75fr_1fr] items-center gap-x-16 max-[1199px]:gap-x-10 max-[991px]:flex max-[991px]:flex-col-reverse max-[991px]:items-stretch max-[991px]:gap-12">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow>Where we come in</Eyebrow>
          <h2 className={`m-0 ${H_SECTION}`}>That&apos;s where Mavuus comes in.</h2>
          <p className={`m-0 mt-4 max-w-[68ch] ${BODY}`}>
            We work with B2B organizations to strengthen their marketing strategy, from understanding what&apos;s working (and what isn&apos;t) to defining target audiences, positioning and messaging, campaign strategy, channel mix, pipeline goals, KPIs and the resources needed to execute.
          </p>
        </Reveal>
        <Reveal variant="clip" className="max-[991px]:w-1/2 max-[479px]:w-3/4">
          <img
            src={WHO_IMAGE.src}
            srcSet={WHO_IMAGE.srcSet}
            sizes="(max-width: 479px) 75vw, (max-width: 991px) 50vw, 442px"
            loading="lazy"
            alt="Marketing team collaborating around a laptop"
            className="block h-auto w-full rounded-2xl"
          />
        </Reveal>
      </div>
    </Section>
  )
}

export default function MarketingServicesPage() {
  return (
    <>
      <ServicesHero />
      <WhereWeComeIn />
      <HowWeHelp />
      <WaysToWork />
      <WhyMavuus />
      <CTABand
        wide
        title="Need a Clearer Marketing Strategy or Ongoing Marketing Support?"
        text="Whether marketing has stalled, your company is entering its next stage of growth, you're launching into a new market or you simply need an experienced outside perspective, we'd be happy to talk. From strategy to execution, we can help you determine what comes next and make it happen."
        buttonLabel="Let's Talk About Your Marketing"
        buttonTo="/contact"
      />
    </>
  )
}
