import LiveButton from '../LiveButton'
import { HERO } from '../../../data/live/services'
import { Eyebrow, Highlight } from './ServiceBits'

const FLOAT = 'absolute z-[2] rounded-2xl bg-white/92 px-5 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.14)] backdrop-blur-[10px]'

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="px-10 max-[767px]:px-5">
        <div className="mx-auto w-full max-w-[1280px] pt-16 pb-20 max-[479px]:pt-8 max-[479px]:pb-12">
          <div className="grid grid-cols-[1.05fr_1fr] items-center gap-x-16 gap-y-12 max-[991px]:grid-cols-1">
            <div className="flex flex-col items-start gap-5">
              <Eyebrow>Marketing Services</Eyebrow>
              <h1 className="text-[49.6px] leading-[1.12] font-medium text-dark-blue max-[991px]:text-[40px] max-[479px]:text-[32px] max-[479px]:leading-[1.12]">
                Marketing Strategy That Gives Your Team a <Highlight>Clearer Path to Growth</Highlight>
              </h1>
              <p className="max-w-[576px] text-lg leading-[1.6] text-[#4b5563]">
                Marketing teams are rarely short on things to do. The harder questions are knowing what to prioritize, where to invest, who to target, what will differentiate you, and whether all that activity is actually contributing to business growth.
              </p>
              <div className="mt-2 flex flex-wrap gap-4 max-[767px]:w-full">
                <LiveButton to="/contact">Let&apos;s Talk About Your Marketing</LiveButton>
                <LiveButton href="#how-we-help" variant="secondary" className="!border-black">
                  See How We Help
                </LiveButton>
              </div>
            </div>

            <div className="group relative p-8">
              <div className="absolute top-0 right-0 h-[85%] w-[80%] rounded-[40px] bg-[#fdf0f4]" />
              <div className="absolute bottom-0 left-0 size-36 animate-[spin_30s_linear_infinite] rounded-full border-2 border-dashed border-[#9cc3dd] motion-reduce:animate-none" />
              <img
                src={HERO.image}
                alt="Mavuus marketing leaders"
                className="relative z-[1] block h-[480px] w-full rounded-3xl object-cover object-[center_25%] transition-transform duration-600 group-hover:scale-[1.02] max-[991px]:h-96"
              />
              <div className={`${FLOAT} animate-[float_6s_ease-in-out_infinite] motion-reduce:animate-none bottom-6 -left-6 flex w-60 flex-col gap-[9.6px] max-[479px]:-bottom-4 max-[479px]:left-0 max-[479px]:w-52`}>
                <div className="text-xs leading-[18px] font-semibold tracking-[1px] text-[#6b7280] uppercase">
                  Your path to growth
                </div>
                {HERO.steps.map((step) => (
                  <div key={step} className="flex items-center gap-[9.6px] text-[14.4px] leading-[21.6px] text-[#1f2937]">
                    <span className="size-[13.6px] shrink-0 rounded-full bg-[#f06f9a] shadow-[0_0_0_4px_rgba(240,111,154,0.18)]" />
                    {step}
                  </div>
                ))}
              </div>
              <div className={`${FLOAT} animate-[float_5s_ease-in-out_0.8s_infinite] motion-reduce:animate-none top-[42%] -right-5 max-w-48 max-[479px]:hidden`}>
                <div className="text-[25.6px] leading-[1.1] font-semibold text-[#1d5c86]">~$2.1M</div>
                <div className="mt-1 text-[12.8px] leading-[1.35] text-[#4b5563]">pipeline from one focused campaign</div>
              </div>
              <div className={`${FLOAT} animate-[float_7s_ease-in-out_1.6s_infinite] motion-reduce:animate-none right-8 -bottom-4 max-w-44 max-[479px]:hidden`}>
                <div className="text-[25.6px] leading-[1.1] font-semibold text-[#1d5c86]">15+</div>
                <div className="mt-1 text-[12.8px] leading-[1.35] text-[#4b5563]">years of B2B tech marketing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
