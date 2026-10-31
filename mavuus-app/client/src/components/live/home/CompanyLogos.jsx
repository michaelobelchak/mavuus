import LiveContainer from '../LiveContainer'
import { COMPANY_LOGOS } from '../../../data/live/home'

export default function CompanyLogos() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="flex flex-col gap-12">
          <h2 className="m-0 text-2xl font-medium leading-[33px]">
            Our marketers have worked at some of the biggest companies:
          </h2>
          <div className="flex items-center justify-start gap-10 max-[479px]:grid max-[479px]:grid-cols-2">
            {COMPANY_LOGOS.map((logo) => (
              <div key={logo.src}>
                <img src={logo.src} alt={logo.alt} loading="lazy" className="inline-block h-8 max-w-full opacity-80 grayscale" />
              </div>
            ))}
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
