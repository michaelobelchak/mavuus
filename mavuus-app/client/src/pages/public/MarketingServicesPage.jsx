import LiveButton from '../../components/live/LiveButton'
import ServicesHero from '../../components/live/services/ServicesHero'
import HowWeHelp from '../../components/live/services/HowWeHelp'
import WaysToWork from '../../components/live/services/WaysToWork'
import WhyMavuus from '../../components/live/services/WhyMavuus'
import { Eyebrow, H2_CLASS } from '../../components/live/services/ServiceBits'
import { CTA_BG, WHO_IMAGE } from '../../data/live/services'

function WhereWeComeIn() {
  return (
    <section>
      <div className="px-10 max-[767px]:px-5">
        <div className="mx-auto w-full max-w-[1280px] py-24 max-[767px]:py-14">
          <div className="grid grid-cols-[1.75fr_1fr] items-center gap-x-16 gap-y-1 max-[991px]:flex max-[991px]:flex-col-reverse max-[991px]:items-stretch max-[991px]:gap-16 max-[767px]:gap-12">
            <div>
              <div className="mb-4">
                <Eyebrow as="p">Where we come in</Eyebrow>
                <h2 className={`mb-8 ${H2_CLASS}`}>That&apos;s where Mavuus comes in.</h2>
              </div>
              <div className="mb-8 max-[991px]:mb-6 max-[767px]:mb-5">
                <p className="text-base leading-[28.8px] text-live-grey">
                  We work with B2B organizations to strengthen their marketing strategy, from understanding what&apos;s working (and what isn&apos;t) to defining target audiences, positioning and messaging, campaign strategy, channel mix, pipeline goals, KPIs and the resources needed to execute.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center max-[991px]:items-start">
              <img
                src={WHO_IMAGE.src}
                srcSet={WHO_IMAGE.srcSet}
                sizes="(max-width: 479px) 48vw, 442px"
                loading="lazy"
                alt="Marketing team collaborating around a laptop"
                className="size-full max-[991px]:h-auto max-[991px]:w-[49vw] max-[479px]:w-[48vw]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesCTA() {
  return (
    <section>
      <div className="px-10 max-[767px]:px-5">
        <div className="py-24 max-[767px]:py-14">
          <div className="mx-auto w-full max-w-[1280px]">
            <div
              className="flex flex-col items-center rounded-[30px] bg-cover bg-[position:0_0] px-16 py-[72px] text-center shadow-[0_0_25px_-5px_rgba(0,0,0,0.153)] max-[767px]:px-6 max-[767px]:py-10"
              style={{ backgroundImage: `url("${CTA_BG}")` }}
            >
              <div className="w-full max-w-[928px]">
                <h2 className="mb-4 text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.2] font-medium text-dark-blue">
                  Need a Clearer Marketing Strategy or Ongoing Marketing Support?
                </h2>
                <p className="mb-8 max-[991px]:mb-6 max-[767px]:mb-5 text-[19.2px] leading-[1.65] text-live-grey max-[767px]:text-[16.8px]">
                  Whether marketing has stalled, your company is entering its next stage of growth, you&apos;re launching into a new market or you simply need an experienced outside perspective, we&apos;d be happy to talk. From strategy to execution, we can help you determine what comes next and make it happen.
                </p>
                <LiveButton to="/contact">Let&apos;s Talk About Your Marketing</LiveButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
      <ServicesCTA />
    </>
  )
}
