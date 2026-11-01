import LiveButton from '../LiveButton'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import CountUp from '../ui/CountUp'
import { H_DISPLAY } from '../ui/Typography'
import { HERO } from '../../../data/live/home'

function StatChip({ value, label, className, delay }) {
  return (
    <Reveal delay={delay} className={`absolute z-[3] ${className}`}>
      <div className="live-float flex flex-col gap-1 rounded-2xl bg-white/92 px-5 py-3.5 shadow-[var(--shadow-live-float)] backdrop-blur-md max-[479px]:px-4 max-[479px]:py-3">
        <CountUp value={value} className="text-[28px] leading-none font-semibold text-dark-blue max-[479px]:text-2xl" />
        <span className="text-sm leading-5 text-live-grey">{label}</span>
      </div>
    </Reveal>
  )
}

export default function HomeHero() {
  return (
    <Section spacing="compact" className="overflow-x-clip">
      <div className="grid grid-cols-[1.1fr_1fr] items-center gap-12 max-[1199px]:grid-cols-[1.15fr_1fr] max-[991px]:gap-8 max-[767px]:grid-cols-1 max-[767px]:gap-10">
        <Reveal className="flex flex-col items-start gap-8 max-[767px]:gap-6">
          <div className="flex flex-col gap-4">
            <h1 className={`${H_DISPLAY} m-0`}>
              Smarter Marketing.
              <br />
              Stronger Marketing Leaders.
              <br />
              <span className="font-bold text-brand-blue">Bigger Business Impact.</span>
            </h1>
            <p className="m-0 text-[22px] leading-[1.4] font-medium text-live-grey max-[991px]:text-lg">
              Marketing Strategy, Execution &amp; Leadership for B2B Growth
            </p>
          </div>
          <div className="grid grid-cols-[auto_auto] gap-4 max-[1199px]:w-full max-[1199px]:max-w-[320px] max-[1199px]:grid-cols-1 max-[767px]:max-w-none">
            <LiveButton to="/marketing-services" className="whitespace-nowrap">
              Explore Marketing Services
            </LiveButton>
            <LiveButton to="/register" variant="outline" className="whitespace-nowrap">
              Join the CMO Community
            </LiveButton>
          </div>
          <div className="flex items-center gap-4 max-[479px]:flex-col max-[479px]:items-start">
            <div className="flex flex-none pl-2">
              {HERO.avatars.map((src) => (
                <img key={src} src={src} alt="" width="36" height="36" className="-ml-2 size-9 rounded-full ring-2 ring-live-bg" />
              ))}
              <span className="-ml-2 flex size-9 items-center justify-center rounded-full bg-live-sky text-xs leading-none font-semibold text-dark-blue ring-2 ring-live-bg">
                +1.7K
              </span>
            </div>
            <p className="m-0 text-base leading-6 text-live-grey">
              <strong className="text-dark-blue">1700+</strong> Members, <strong className="text-dark-blue">1100+</strong> Marketing Leaders
            </p>
          </div>
        </Reveal>

        <div className="relative mx-auto w-full max-w-[560px] max-[767px]:max-w-[480px]">
          <Reveal variant="clip">
            <img
              src={HERO.image}
              srcSet={HERO.imageSrcSet}
              sizes="(max-width: 767px) 90vw, 45vw"
              width="1070"
              height="1119"
              fetchPriority="high"
              alt="Mavuus founders Dilya and Elmira Abushayeva"
              className="block h-auto w-full rounded-3xl"
            />
          </Reveal>
          <StatChip value="1100+" label="Marketing Leaders" delay={500} className="top-[46%] -right-6 max-[1199px]:right-2" />
          <StatChip value="260+" label="Fractional CMOs" delay={650} className="-bottom-6 left-[-6%] [&_.live-float]:[animation-delay:-3s] max-[1199px]:left-2" />
        </div>
      </div>
    </Section>
  )
}
