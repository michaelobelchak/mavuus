import Card from '../ui/Card'
import CountUp from '../ui/CountUp'
import Reveal from '../ui/Reveal'
import Section from '../ui/Section'
import { BODY, Eyebrow, H_SECTION, Label } from '../ui/Typography'
import { WHY } from '../../../data/live/services'

const PARAGRAPH = `m-0 max-w-[68ch] ${BODY}`

export default function WhyMavuus() {
  return (
    <Section>
      <div className="grid grid-cols-[1fr_1.1fr] items-stretch gap-x-16 gap-y-10 max-[1199px]:gap-x-10 max-[991px]:grid-cols-1">
        <Reveal variant="clip" className="relative min-h-[448px] max-[991px]:min-h-[352px] max-[479px]:min-h-[280px]">
          <img
            src={WHY.image}
            srcSet={WHY.srcSet}
            sizes="(max-width: 991px) 100vw, 580px"
            loading="lazy"
            alt="Mavuus co-founders Elmira Abushayeva and Dilya Abushayeva"
            className="absolute inset-0 size-full rounded-2xl object-cover object-[center_20%]"
          />
        </Reveal>
        <div className="flex flex-col gap-4">
          <Reveal className="flex flex-col gap-4">
            <Eyebrow>Why Mavuus?</Eyebrow>
            <h2 className={`m-0 ${H_SECTION}`}>
              Senior Marketing Experience.
              <br />
              A Broader Perspective.
            </h2>
          </Reveal>
          {WHY.intro.map((text) => (
            <p key={text} className={PARAGRAPH}>{text}</p>
          ))}
          <p className="m-0 max-w-[68ch] text-lg leading-[1.5] font-semibold text-dark-blue">{WHY.question}</p>
          <Reveal>
            <Card variant="feature" rule className="my-2 flex flex-col gap-3 px-7 py-6 max-[767px]:px-5">
              <Label as="p" className="m-0">Recent example</Label>
              <div className="grid grid-cols-[auto_auto] justify-start gap-x-10 max-[479px]:gap-x-6">
                {WHY.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <CountUp value={stat.num} className="text-4xl leading-[1.1] font-semibold text-brand-blue" />
                    <span className="text-[15px] leading-6 text-live-grey">{stat.label}</span>
                  </div>
                ))}
              </div>
              <p className="m-0 max-w-[68ch] text-[15px] leading-6 text-live-grey">{WHY.example}</p>
            </Card>
          </Reveal>
          {WHY.outro.map((text) => (
            <p key={text} className={PARAGRAPH}>{text}</p>
          ))}
        </div>
      </div>
    </Section>
  )
}
