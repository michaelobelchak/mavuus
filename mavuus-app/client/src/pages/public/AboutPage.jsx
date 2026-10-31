import { Helmet } from 'react-helmet-async'
import LiveContainer from '../../components/live/LiveContainer'
import CTABand from '../../components/live/CTABand'
import SecondaryHero from '../../components/live/info/SecondaryHero'
import { ABOUT_HERO, WHO_WE_ARE, ORIGIN } from '../../data/live/about'

const EYEBROW = 'inline text-[clamp(16px,2vw,20px)] leading-[26px] font-medium tracking-[1px] text-brand-pink uppercase'
const H2 = 'mb-8 w-full text-[28px] leading-[1.2] font-normal text-balance text-dark-blue max-[991px]:text-[clamp(25px,5vw,48px)] max-md:text-[32px]'
const BODY = 'text-base leading-[28.8px] text-live-grey'

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
      {children}
    </a>
  )
}

function WhoWeAre() {
  const { links, image } = WHO_WE_ARE
  return (
    <section className="text-dark-blue">
      <LiveContainer innerClassName="py-24">
        <div className="py-16 max-[991px]:py-24">
          <div className="grid grid-cols-[1.75fr_1fr] items-start gap-x-16 gap-y-1 max-[991px]:flex max-[991px]:flex-col-reverse max-[991px]:flex-wrap max-[991px]:gap-16 max-md:gap-12">
            <div>
              <div className="mb-4">
                <p className={EYEBROW}>{WHO_WE_ARE.eyebrow}</p>
                <h2 className={H2}>{WHO_WE_ARE.heading}</h2>
              </div>
              <div className="mb-8 max-[991px]:mb-6 max-md:mb-5">
                <p className={BODY}>
                  <ExternalLink href={links.mavuus}>Mavuus</ExternalLink> was born from a spark of inspiration by two
                  sisters, <ExternalLink href={links.dilya}>Dilya Abushayeva</ExternalLink> and{' '}
                  <ExternalLink href={links.elmira}>Elmira Abushayeva</ExternalLink>
                  {WHO_WE_ARE.firstParagraphRest}
                  {WHO_WE_ARE.paragraphs.map((text) => (
                    <span key={text}>
                      <br />
                      <br />
                      {text}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center max-[991px]:w-[49vw] max-[991px]:self-start max-[479px]:w-[48vw]">
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.sizes}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}

function Origin() {
  return (
    <section className="text-dark-blue">
      <img
        src={ORIGIN.image.src}
        srcSet={ORIGIN.image.srcSet}
        sizes="(max-width: 1920px) 100vw, 1920px"
        alt={ORIGIN.image.alt}
        loading="lazy"
        className="inline-block w-full max-[479px]:aspect-video max-[479px]:object-cover"
      />
      <LiveContainer className="relative -mt-[100px] max-md:mt-0">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center bg-white p-[100px] text-center max-[991px]:p-12 max-[479px]:px-0">
          <div className="mb-4">
            <p className={EYEBROW}>{ORIGIN.eyebrow}</p>
            <h2 className={H2}>{ORIGIN.heading}</h2>
          </div>
          <div className="mb-8 max-[991px]:mb-6 max-md:mb-5">
            <p className={`${BODY} columns-2 text-left max-md:columns-1`}>
              Coming up with a new name for your own company is a dream job for any marketer. So of course we took our
              sweet time and embarked on an extensive branding exercise. <br />
              <br />
              Do we want it to be descriptive of what we do? <br />
              Do we want it to be catchy and recognizable? <br />
              Do we want it to have explicit meaning? <br />
              We filled our notebooks with brainstorming ideas.
              <br />
              <br />
              Keywords like ‘network,’ ‘leadership,’ ‘collaboration,’ and ‘exclusivity’ rose to the top, but none truly
              resonated with the deeper value of our platform.
              <br />
              <br />
              What defines Mavuus is its ability to connect marketing <strong>‘MAVENS’</strong> from our trusted circles,
              offering <strong>‘US’</strong> the chance to network, learn, and grow together as leaders.
              <br />
              <br />
              MAVE-US &gt; <strong>MAVUUS</strong>
              <br />
              <br />
              Let’s harness the true power of our collective knowledge and experience through the marketing ‘MAVENS’
              among ‘US.’
            </p>
          </div>
        </div>
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
      <SecondaryHero title={ABOUT_HERO.title}>
        {ABOUT_HERO.text}
        <br />
        <br />
      </SecondaryHero>
      <WhoWeAre />
      <Origin />
      <CTABand />
    </>
  )
}
