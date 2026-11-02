import LiveButton from '../LiveButton'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import CheckList from '../ui/CheckList'
import { BODY, Eyebrow, H_CARD, H_SECTION, H_SMALL } from '../ui/Typography'
import { MARKETERS_IMAGE, MARKETERS_LIST } from '../../../data/live/home'

export default function ForMarketers() {
  return (
    <Section>
      <Reveal className="mb-12 flex flex-col gap-4 max-[767px]:mb-10">
        <Eyebrow>For Marketing Leaders</Eyebrow>
        <h2 className={`${H_SECTION} m-0`}>Connect. Learn. Lead.</h2>
      </Reveal>
      <div className="grid grid-cols-2 items-center gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <Reveal variant="clip" className="mx-auto w-full max-w-[608px] max-[991px]:order-last">
          <img
            src={MARKETERS_IMAGE.src}
            srcSet={MARKETERS_IMAGE.srcSet}
            sizes="(max-width: 991px) 100vw, 50vw"
            width="608"
            height="608"
            loading="lazy"
            alt="Grid of Mavuus community members around the Mavuus logo"
            className="block h-auto w-full rounded-2xl"
          />
        </Reveal>
        <div className="flex flex-col items-start gap-8">
          <Reveal className="flex flex-col gap-3">
            <p className={`${H_SMALL} m-0`}>Great marketing leadership doesn&apos;t happen in isolation.</p>
            <p className={`${BODY} m-0`}>
              Mavuus brings together senior marketing professionals who believe in learning from one another,
              exchanging ideas and building meaningful professional relationships.
            </p>
          </Reveal>
          <div className="flex flex-col gap-5">
            <h3 className={`${H_CARD} m-0`}>Join our community to:</h3>
            <CheckList items={MARKETERS_LIST} />
          </div>
          <Reveal className="flex flex-col items-start gap-8 max-[767px]:w-full">
            <p className={`${BODY} m-0`}>
              Whether you&apos;re navigating new leadership challenges, exploring fresh perspectives or simply looking to
              connect with peers who understand your world, Mavuus provides a place to learn and grow together.
            </p>
            <LiveButton to="/register" variant="outline" className="whitespace-nowrap">
              Join the CMO Community
            </LiveButton>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
