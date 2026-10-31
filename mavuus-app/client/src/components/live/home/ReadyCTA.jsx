import LiveButton from '../LiveButton'
import LiveContainer from '../LiveContainer'
import { BODY, H2, OutlineButton } from './shared'
import { READY_IMAGE } from '../../../data/live/home'

export default function ReadyCTA() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="grid grid-cols-2 items-center gap-x-16 gap-y-1 max-[991px]:grid-cols-1 max-[991px]:gap-y-16 max-[767px]:gap-y-12">
          <div>
            <h2 className={`${H2} mb-8`}>Ready to Turn Your Marketing into Revenue?</h2>
            <h4 className="mb-4 text-[21.6px] font-medium leading-[1.4] max-[767px]:text-[22.4px]">
              Whether you need a clearer marketing strategy, experienced leadership or a team to bring your plans for
              growth to life, we&apos;re here to help.
            </h4>
            <p className={`${BODY} mb-8 max-[767px]:mb-5`}>Let&apos;s explore how Mavuus can support your next stage of growth.</p>
            <div className="flex flex-wrap gap-4">
              <LiveButton to="/contact" variant="pink">
                Let&apos;s Talk About Your Marketing
              </LiveButton>
              <OutlineButton to="/marketing-services">Explore Our Marketing Services</OutlineButton>
            </div>
          </div>
          <div>
            <img
              src={READY_IMAGE.src}
              srcSet={READY_IMAGE.srcSet}
              sizes="(max-width: 479px) 100vw, 49vw"
              width="608"
              height="686"
              loading="lazy"
              alt="Mavuus founders Elmira and Dilya Abushayeva"
              className="inline-block h-auto w-full max-w-full"
            />
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
