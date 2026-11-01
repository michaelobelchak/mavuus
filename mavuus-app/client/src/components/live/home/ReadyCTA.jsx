import LiveButton from '../LiveButton'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import { BODY, H_CARD, H_SECTION } from '../ui/Typography'
import { READY_IMAGE } from '../../../data/live/home'

export default function ReadyCTA() {
  return (
    <Section>
      <div className="grid grid-cols-2 items-center gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <Reveal className="flex flex-col items-start gap-6">
          <h2 className={`${H_SECTION} m-0`}>Ready to Turn Your Marketing into Revenue?</h2>
          <p className={`${H_CARD} m-0`}>
            Whether you need a clearer marketing strategy, experienced leadership or a team to bring your plans for
            growth to life, we&apos;re here to help.
          </p>
          <p className={`${BODY} m-0`}>Let&apos;s explore how Mavuus can support your next stage of growth.</p>
          <div className="mt-2 flex flex-wrap gap-4 max-[767px]:w-full max-[767px]:flex-col">
            <LiveButton to="/contact" className="whitespace-nowrap">
              Let&apos;s Talk About Your Marketing
            </LiveButton>
            <LiveButton to="/marketing-services" variant="outline" className="whitespace-nowrap">
              Explore Our Marketing Services
            </LiveButton>
          </div>
        </Reveal>
        <Reveal variant="clip" className="mx-auto w-full max-w-[608px]">
          <img
            src={READY_IMAGE.src}
            srcSet={READY_IMAGE.srcSet}
            sizes="(max-width: 991px) 100vw, 50vw"
            width="1176"
            height="1329"
            loading="lazy"
            alt="Mavuus founders Elmira and Dilya Abushayeva"
            className="block h-auto w-full rounded-2xl"
          />
        </Reveal>
      </div>
    </Section>
  )
}
