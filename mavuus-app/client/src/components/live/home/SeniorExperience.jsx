import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import CountUp from '../ui/CountUp'
import { BODY, H_SECTION } from '../ui/Typography'
import { EXPERIENCE_IMAGE, EXPERIENCE_STATS } from '../../../data/live/home'

export default function SeniorExperience() {
  return (
    <Section>
      <div className="grid grid-cols-[1fr_1.1fr] items-center gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <div className="flex flex-col gap-8">
          <Reveal as="h2" className={`${H_SECTION} m-0`}>
            Senior Marketing Experience.
            <br />A Broader Perspective.
          </Reveal>
          <div className="grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
            {EXPERIENCE_STATS.map((stat, i) => (
              <Reveal key={stat.label} index={i}>
                <Card rule interactive className="flex h-full flex-col gap-1.5 px-6 py-5">
                  <CountUp value={stat.value} className="text-4xl leading-[1.1] font-bold text-brand-blue" />
                  <span className="text-[15px] leading-[1.4] text-live-grey">{stat.label}</span>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal className="flex flex-col gap-5">
            <p className={`${BODY} m-0`}>
              We bring 15+ years of B2B technology marketing experience and a practical, no-fluff approach to every
              engagement. Our goal is simple: turn complex marketing challenges into a clear, actionable strategy that
              teams can actually execute.
            </p>
            <p className={`${BODY} m-0`}>
              Mavuus is also home to a community of 1,100+ CMOs and senior marketing leaders. That community makes our
              consulting practice stronger. It keeps us close to the real challenges marketing leaders face and helps us
              evolve our approach through their collective experience.
            </p>
          </Reveal>
        </div>
        <Reveal variant="clip" className="mx-auto w-full max-w-[640px]">
          <div className="live-float">
            <img
              src={EXPERIENCE_IMAGE.src}
              srcSet={EXPERIENCE_IMAGE.srcSet}
              sizes="(max-width: 991px) 100vw, 50vw"
              width="1322"
              height="1158"
              loading="lazy"
              alt="Marketing leader with community and engagement stats"
              className="block h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
