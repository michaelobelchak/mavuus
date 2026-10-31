import LiveContainer from '../LiveContainer'
import { BODY, Eyebrow, H2 } from './shared'
import { BUSINESS_IMAGE } from '../../../data/live/home'

export default function ForBusinesses() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="grid grid-cols-2 items-center gap-x-8 gap-y-1 max-[991px]:grid-cols-1 max-[991px]:gap-y-16 max-[767px]:gap-y-12">
          <div>
            <Eyebrow className="mb-4">For Businesses</Eyebrow>
            <h2 className={`${H2} mb-8`}>Marketing Strategy, Execution &amp; Leadership</h2>
            <p className={`${BODY} mb-8 max-[767px]:mb-5`}>
              We work with organizations to strengthen their marketing strategy, from understanding what’s working (and
              what isn’t) to defining target audiences, positioning and messaging, campaign strategy, channel mix,
              pipeline goals, KPIs and the resources needed to execute.
            </p>
          </div>
          <div className="group overflow-hidden rounded-[20px] min-[992px]:order-first">
            <img
              src={BUSINESS_IMAGE.src}
              srcSet={BUSINESS_IMAGE.srcSet}
              sizes="(max-width: 479px) 100vw, 49vw"
              loading="lazy"
              alt="Marketing team working together at a laptop"
              className="block h-full w-full rounded-[20px] transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
