import { WHY } from '../../../data/live/services'
import { Eyebrow, H2_CLASS, LABEL_CLASS } from './ServiceBits'

const BODY = 'text-base leading-[28.8px] text-live-grey'

export default function WhyMavuus() {
  return (
    <section>
      <div className="px-10 max-[767px]:px-5">
        <div className="mx-auto w-full max-w-[1280px] py-24 max-[767px]:py-14">
          <div className="grid grid-cols-[1fr_1.1fr] items-stretch gap-x-16 gap-y-10 max-[991px]:grid-cols-1">
            <div className="relative min-h-[448px] max-[991px]:min-h-[352px]">
              <img
                src={WHY.image}
                srcSet={WHY.srcSet}
                sizes="(max-width: 991px) 100vw, 580px"
                loading="lazy"
                alt="Mavuus co-founders Elmira Abushayeva and Dilya Abushayeva"
                className="absolute inset-0 size-full rounded-[20px] object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Eyebrow>Why Mavuus?</Eyebrow>
              <h2 className={H2_CLASS}>
                Senior Marketing Experience.
                <br />
                A Broader Perspective.
              </h2>
              {WHY.intro.map((text) => (
                <p key={text} className={BODY}>{text}</p>
              ))}
              <p className="text-lg leading-[1.5] font-semibold text-[#1f2937]">{WHY.question}</p>
              <div className="my-2 flex flex-col gap-3 rounded-2xl border-l-4 border-[#f06f9a] bg-[#fdf0f4] px-7 py-6">
                <div className={`mt-2 ${LABEL_CLASS}`}>Recent example</div>
                <div className="flex flex-wrap gap-x-10 gap-y-4">
                  {WHY.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <div className="text-[36px] leading-[1.1] font-semibold text-[#1d5c86]">{stat.num}</div>
                      <div className="text-[15.2px] leading-[1.5] text-[#4b5563]">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[13.6px] leading-[1.5] text-live-grey">{WHY.example}</p>
              </div>
              {WHY.outro.map((text) => (
                <p key={text} className={BODY}>{text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
