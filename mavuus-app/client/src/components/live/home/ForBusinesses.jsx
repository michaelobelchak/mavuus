import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import { Eyebrow, H_SECTION, LEAD } from '../ui/Typography'
import ServiceTabs from './ServiceTabs'
import { BUSINESS_IMAGE } from '../../../data/live/home'

export default function ForBusinesses() {
  return (
    <Section>
      <div className="grid grid-cols-2 items-center gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <Reveal className="flex flex-col gap-4 min-[992px]:order-last">
          <Eyebrow>For Businesses</Eyebrow>
          <h2 className={`${H_SECTION} m-0`}>Marketing Strategy, Execution &amp; Leadership</h2>
          <p className={`${LEAD} m-0`}>
            We work with organizations to strengthen their marketing strategy, from understanding what’s working (and
            what isn’t) to defining target audiences, positioning and messaging, campaign strategy, channel mix,
            pipeline goals, KPIs and the resources needed to execute.
          </p>
        </Reveal>
        <Reveal variant="clip" className="relative">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={BUSINESS_IMAGE.src}
              srcSet={BUSINESS_IMAGE.srcSet}
              sizes="(max-width: 991px) 100vw, 50vw"
              width="1542"
              height="968"
              loading="lazy"
              alt="Marketing team working together at a laptop"
              className="block h-auto w-full"
            />
          </div>
          <Link
            to="/marketing-services"
            aria-label="Explore our marketing services"
            className="group absolute bottom-[0.6%] left-[1.6%] flex aspect-square w-[9.2%] min-w-11 items-center justify-center rounded-full bg-white text-brand-pink ring-1 ring-black/10 transition-[background-color,color] duration-300 hover:bg-brand-pink hover:text-white"
          >
            <ArrowUpRight className="size-1/2 transition-transform duration-300 ease-[var(--ease-live)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
        </Reveal>
      </div>
      <ServiceTabs />
    </Section>
  )
}
