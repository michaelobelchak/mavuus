import LiveContainer from '../LiveContainer'
import { BODY, CARD } from './shared'
import { EXPERIENCE_IMAGE, EXPERIENCE_STATS } from '../../../data/live/home'

export default function SeniorExperience() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="grid grid-cols-[1fr_1.1fr] items-center gap-x-16 gap-y-1 max-[991px]:grid-cols-1 max-[991px]:gap-y-16 max-[767px]:gap-y-12">
          <div>
            <h2 className="mb-8 w-full text-[clamp(2.25rem,3.6vw,3.25rem)] font-normal leading-[1.12] [text-wrap:balance]">
              Senior Marketing Experience.
              <br />A Broader Perspective.
            </h2>
            <div className="mb-8 grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
              {EXPERIENCE_STATS.map((stat) => (
                <div key={stat.label} className={`flex flex-col gap-y-[5.6px] px-6 py-5 ${CARD}`}>
                  <div className="text-4xl font-semibold leading-[1.1]">
                    <span className="font-bold text-brand-blue">{stat.value}</span>
                  </div>
                  <div className="text-[15.2px] leading-[1.4] text-[#4b5563]">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className={`${BODY} mb-8 max-[767px]:mb-5`}>
              We bring 15+ years of B2B technology marketing experience and a practical, no-fluff approach to every
              engagement. Our goal is simple: turn complex marketing challenges into a clear, actionable strategy that
              teams can actually execute.
            </p>
            <p className={BODY}>
              Mavuus is also home to a community of 1,100+ CMOs and senior marketing leaders. That community makes our
              consulting practice stronger. It keeps us close to the real challenges marketing leaders face and helps us
              evolve our approach through their collective experience.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full animate-[float_8s_ease-in-out_infinite] max-[991px]:animate-none">
              <img
                src={EXPERIENCE_IMAGE.src}
                srcSet={EXPERIENCE_IMAGE.srcSet}
                sizes="(max-width: 479px) 100vw, 49vw"
                loading="lazy"
                alt="Marketing leader with community and engagement stats"
                className="h-auto w-full max-w-none scale-[1.08] max-[991px]:scale-100"
              />
            </div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
