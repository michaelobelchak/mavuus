import LiveButton from '../LiveButton'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import CountUp from '../ui/CountUp'
import { Eyebrow, H_DISPLAY, Highlight, LEAD, Label } from '../ui/Typography'
import { HERO } from '../../../data/live/services'

const CHIP = 'live-float absolute z-[2] rounded-2xl bg-white/92 px-5 py-4 shadow-[var(--shadow-live-float)] backdrop-blur-md'
const CHIP_STAT = 'text-2xl leading-[1.1] font-semibold text-brand-blue'
const CHIP_TEXT = 'mt-1 text-sm leading-5 text-live-grey'

export default function ServicesHero() {
  return (
    <Section spacing="compact" className="overflow-x-clip">
      <div className="grid grid-cols-[1.05fr_1fr] items-center gap-x-16 gap-y-12 max-[1199px]:gap-x-10 max-[991px]:grid-cols-1">
        <Reveal className="flex flex-col items-start gap-5">
          <Eyebrow>Marketing Services</Eyebrow>
          <h1 className={`m-0 ${H_DISPLAY}`}>
            Marketing Strategy That Gives Your Team a <Highlight>Clearer Path to Growth</Highlight>
          </h1>
          <p className={`m-0 max-w-xl ${LEAD}`}>
            Marketing teams are rarely short on things to do. The harder questions are knowing what to prioritize, where to invest, who to target, what will differentiate you, and whether all that activity is actually contributing to business growth.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 max-[767px]:w-full">
            <LiveButton to="/contact" className="whitespace-nowrap">Let&apos;s Talk About Your Marketing</LiveButton>
            <LiveButton href="#how-we-help" variant="outline" className="whitespace-nowrap">See How We Help</LiveButton>
          </div>
        </Reveal>

        <div className="relative p-8 max-[479px]:px-0 max-[479px]:pt-6">
          <div aria-hidden="true" className="absolute top-0 right-0 h-[85%] w-4/5 rounded-3xl bg-live-pink-50" />
          <Reveal variant="clip" className="relative z-[1]">
            <img
              src={HERO.image}
              alt="Mavuus marketing leaders"
              className="block h-[480px] w-full rounded-3xl object-cover object-[center_25%] max-[991px]:h-96"
            />
          </Reveal>
          <div className={`${CHIP} bottom-6 -left-6 flex w-60 flex-col gap-2.5 max-[479px]:-bottom-4 max-[479px]:left-0 max-[479px]:w-56`}>
            <Label>Your path to growth</Label>
            {HERO.steps.map((step) => (
              <div key={step} className="flex items-center gap-2.5 text-sm leading-5 text-dark-blue">
                <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full bg-brand-pink shadow-[0_0_0_4px_var(--color-live-pink-50)]" />
                {step}
              </div>
            ))}
          </div>
          <div className={`${CHIP} top-[42%] -right-5 max-w-48 [animation-delay:0.8s] max-[1199px]:right-0 max-[479px]:hidden`}>
            <CountUp value="~$2.1M" className={`block ${CHIP_STAT}`} />
            <p className={`m-0 ${CHIP_TEXT}`}>pipeline from one focused campaign</p>
          </div>
          <div className={`${CHIP} right-8 -bottom-4 max-w-44 [animation-delay:1.6s] max-[479px]:hidden`}>
            <CountUp value="15+" className={`block ${CHIP_STAT}`} />
            <p className={`m-0 ${CHIP_TEXT}`}>years of B2B tech marketing</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
