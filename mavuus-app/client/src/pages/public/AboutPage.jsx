import { Helmet } from 'react-helmet-async'
import LiveContainer from '../../components/live/LiveContainer'
import CTABand from '../../components/live/CTABand'
import PageHero from '../../components/live/info/PageHero'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import { cardClass } from '../../components/live/ui/cardStyles'
import { BODY, Eyebrow, H_SECTION } from '../../components/live/ui/Typography'
import { ABOUT_HERO, WHO_WE_ARE, ORIGIN } from '../../data/live/about'

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-blue underline underline-offset-[3px] transition-colors hover:text-brand-pink"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

function WhoWeAre() {
  const { links, image } = WHO_WE_ARE
  return (
    <Section>
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow>{WHO_WE_ARE.eyebrow}</Eyebrow>
          <h2 className={`m-0 mb-4 ${H_SECTION}`}>{WHO_WE_ARE.heading}</h2>
          <div className="flex max-w-[68ch] flex-col gap-5">
            <p className={`m-0 ${BODY}`}>
              <ExternalLink href={links.mavuus}>Mavuus</ExternalLink> was born from a spark of inspiration by two
              sisters, <ExternalLink href={links.dilya}>Dilya Abushayeva</ExternalLink> and{' '}
              <ExternalLink href={links.elmira}>Elmira Abushayeva</ExternalLink>
              {WHO_WE_ARE.firstParagraphRest}
            </p>
            {WHO_WE_ARE.paragraphs.map((text) => (
              <p key={text} className={`m-0 ${BODY}`}>{text}</p>
            ))}
          </div>
        </Reveal>
        <Reveal variant="clip" className="overflow-hidden rounded-3xl max-[991px]:order-first">
          <img src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={image.alt} loading="lazy" className="block h-auto w-full max-[991px]:aspect-[4/3] max-[991px]:object-cover max-[991px]:object-[center_25%]" />
        </Reveal>
      </div>
    </Section>
  )
}

function Origin() {
  return (
    <section>
      <img
        src={ORIGIN.image.src}
        srcSet={ORIGIN.image.srcSet}
        sizes="(max-width: 1920px) 100vw, 1920px"
        alt={ORIGIN.image.alt}
        loading="lazy"
        className="block w-full max-[479px]:aspect-video max-[479px]:object-cover"
      />
      <LiveContainer className="relative -mt-[100px] max-[991px]:-mt-16 max-[767px]:-mt-10">
        <Reveal
          className={cardClass({
            variant: 'feature',
            className: 'mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-16 py-14 text-center max-[991px]:px-10 max-[767px]:px-6 max-[767px]:py-10',
          })}
        >
          <Eyebrow>{ORIGIN.eyebrow}</Eyebrow>
          <h2 className={`m-0 mb-4 ${H_SECTION}`}>{ORIGIN.heading}</h2>
          <div className={`columns-2 gap-12 text-left max-[991px]:columns-1 ${BODY} [&>p]:mb-5 [&>p:last-child]:mb-0 [&>p]:break-inside-avoid [&>p]:text-[length:inherit] [&>p]:leading-[inherit]`}>
            <p>
              Coming up with a new name for your own company is a dream job for any marketer. So of course we took our
              sweet time and embarked on an extensive branding exercise.
            </p>
            <p>
              Do we want it to be descriptive of what we do? <br />
              Do we want it to be catchy and recognizable? <br />
              Do we want it to have explicit meaning? <br />
              We filled our notebooks with brainstorming ideas.
            </p>
            <p>
              Keywords like ‘network,’ ‘leadership,’ ‘collaboration,’ and ‘exclusivity’ rose to the top, but none truly
              resonated with the deeper value of our platform.
            </p>
            <p>
              What defines Mavuus is its ability to connect marketing <strong>‘MAVENS’</strong> from our trusted circles,
              offering <strong>‘US’</strong> the chance to network, learn, and grow together as leaders.
            </p>
            <p>
              MAVE-US &gt; <strong>MAVUUS</strong>
            </p>
            <p>
              Let’s harness the true power of our collective knowledge and experience through the marketing ‘MAVENS’
              among ‘US.’
            </p>
          </div>
        </Reveal>
      </LiveContainer>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us - Mavuus</title>
        <meta
          name="description"
          content="Mavuus helps CMOs elevate their executive influence through building a community, connecting the right people and sparking the right conversations."
        />
      </Helmet>
      <PageHero display title={ABOUT_HERO.title} lead={ABOUT_HERO.text} />
      <WhoWeAre />
      <Origin />
      <CTABand />
    </>
  )
}
