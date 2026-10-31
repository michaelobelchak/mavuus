import LiveButton from '../LiveButton'
import LiveContainer from '../LiveContainer'
import { OutlineButton } from './shared'
import { HERO } from '../../../data/live/home'

const STAT_CARD =
  'absolute z-[3] flex items-center justify-center rounded-[11px] border border-white bg-[#e0dbdbbf] p-4 backdrop-blur-[20px] animate-[float_6s_ease-in-out_infinite] max-[767px]:scale-80'

export default function HomeHero() {
  return (
    <section className="relative -mt-[113px] flex flex-col justify-center overflow-clip max-[991px]:pt-12 max-[767px]:pt-4 max-[479px]:pt-8">
      <LiveContainer innerClassName="pt-24 pb-10">
        <div className="grid grid-cols-2 items-center gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-16">
          <div className="grid max-w-[70rem] grid-cols-1 content-start items-start justify-items-start gap-8 pt-32 max-[767px]:pt-24">
            <div className="flex w-full flex-col gap-4">
              <h1 className="m-0 text-[clamp(2.1rem,2.9vw,2.75rem)] font-medium leading-[1.14] text-black">
                Smarter Marketing.
                <br />
                Stronger Marketing Leaders.
                <br />
                <span className="font-bold text-brand-blue">Bigger Business Impact.</span>
              </h1>
              <h2 className="m-0 text-[1.4rem] font-medium leading-[1.4] text-[#4b5563]">
                Marketing Strategy, Execution &amp; Leadership for B2B Growth
              </h2>
              <div className="mt-8 flex items-center justify-start gap-4 max-[767px]:mt-5 max-[767px]:flex-wrap max-[767px]:justify-between">
                <LiveButton to="/marketing-services" variant="pink">
                  Explore Marketing Services
                </LiveButton>
                <OutlineButton to="/register">Join the CMO Community</OutlineButton>
              </div>
            </div>
            <div className="flex gap-4 max-[767px]:items-center max-[767px]:justify-start max-[479px]:flex-col max-[479px]:items-start">
              <div className="flex flex-none">
                {HERO.avatars.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Mavuus member ${i + 1}`}
                    className="-ml-[9px] size-8 max-w-full rounded-[20px]"
                  />
                ))}
                <div className="-ml-2.5 flex size-8 items-center justify-center rounded-full bg-[#9acbe8]">
                  <div className="text-[9.6px] font-medium leading-[14.4px] text-black">+1000</div>
                </div>
              </div>
              <p className="m-0">
                <strong>1700+</strong> Members ,<strong> 1100+</strong> Marketing Leaders
              </p>
            </div>
          </div>

          <div className="relative max-[991px]:ml-[15%] max-[479px]:ml-0">
            <div className={`${STAT_CARD} bottom-[158px] right-[2%] mr-[26px] min-w-32 flex-col gap-2 text-center [animation-delay:1.5s] max-[767px]:bottom-28 max-[767px]:right-[-7%] max-[479px]:bottom-[-30px] max-[479px]:right-0 max-[479px]:mr-0`}>
              <div className="text-[1.7rem] font-medium leading-[40.8px] text-black">1100+</div>
              <div className="text-[13.6px] leading-[20.4px] text-black">Marketing Leaders</div>
            </div>
            <div className={`${STAT_CARD} bottom-[-30px] left-1/2 -ml-[25%] gap-4 max-[479px]:left-0 max-[479px]:ml-0`}>
              <div className="text-[1.7rem] font-medium leading-[40.8px] text-black">260+</div>
              <div className="text-[13.6px] leading-[20.4px] text-black">
                Fractional
                <br />
                CMOs
              </div>
            </div>
            <img
              src={HERO.image}
              srcSet={HERO.imageSrcSet}
              sizes="(max-width: 1070px) 100vw, 1070px"
              alt="Mavuus founders Dilya and Elmira Abushayeva"
              className="relative z-[2] inline-block h-full w-[90%] max-w-full object-contain pt-32 max-[479px]:w-full max-[479px]:pt-0"
            />
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
