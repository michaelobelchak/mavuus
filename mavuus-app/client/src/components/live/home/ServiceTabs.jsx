import { useEffect, useState } from 'react'
import LiveButton from '../LiveButton'
import LiveContainer from '../LiveContainer'
import { SERVICE_TABS } from '../../../data/live/home'

const SCALE_LABEL = 'flex-none text-[12.8px] font-semibold uppercase leading-[19.2px] tracking-[1px] text-[#6b7280]'

export default function ServiceTabs() {
  const [active, setActive] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const current = SERVICE_TABS[active]

  useEffect(() => {
    if (!autoplay) return undefined
    const timer = setInterval(() => setActive((i) => (i + 1) % SERVICE_TABS.length), 5000)
    return () => clearInterval(timer)
  }, [autoplay])

  const select = (i) => {
    setAutoplay(false)
    setActive(i)
  }

  return (
    <section>
      <LiveContainer innerClassName="pb-24 max-[767px]:pb-14">
        <div className="mb-2 flex flex-col gap-10">
          <div className="flex items-center gap-x-4 max-[479px]:flex-wrap">
            <span className={SCALE_LABEL}>Strategy</span>
            <div className="relative h-1.5 grow overflow-hidden rounded-full bg-[#e5e7eb] max-[479px]:order-3 max-[479px]:min-w-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#9cc3dd,#f06f9a)] transition-[width] duration-500"
                style={{ width: `${((active + 1) / SERVICE_TABS.length) * 100}%` }}
              />
            </div>
            <span className={SCALE_LABEL}>Leadership</span>
          </div>

          <div className="grid grid-cols-[1fr_1.25fr] items-start gap-x-16 gap-y-8 max-[991px]:grid-cols-1">
            <div className="flex flex-col border-l-2 border-[#e5e7eb]" role="tablist" aria-label="Marketing services">
              {SERVICE_TABS.map((tab, i) => {
                const isActive = i === active
                return (
                  <button
                    key={tab.num}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => select(i)}
                    onMouseEnter={() => select(i)}
                    className={`group -ml-0.5 flex cursor-pointer items-start gap-x-5 border-l-2 py-5 pl-6 pr-4 text-left transition-all duration-[250ms] ${
                      isActive
                        ? 'border-[#f06f9a] bg-[linear-gradient(90deg,rgba(240,111,154,0.08),transparent)]'
                        : 'border-transparent'
                    }`}
                  >
                    <span
                      className={`text-[17.6px] font-semibold leading-[1.4] transition-colors duration-[250ms] ${
                        isActive ? 'text-[#f06f9a]' : 'text-[#9ca3af]'
                      }`}
                    >
                      {tab.num}
                    </span>
                    <span className="flex flex-col gap-y-1">
                      <span
                        className={`text-xl font-medium leading-[1.3] transition-colors duration-[250ms] group-hover:text-[#111827] ${
                          isActive ? 'text-[#111827]' : 'text-[#6b7280]'
                        }`}
                      >
                        {tab.title}
                      </span>
                      <span className={`text-[15.2px] leading-[22.8px] ${isActive ? 'text-[#e85a8a]' : 'text-[#9ca3af]'}`}>
                        {tab.tag}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="relative" role="tabpanel">
              <div key={current.num} className="flex animate-fade-in flex-col gap-y-4 pt-2">
                <div className="text-[96px] font-semibold leading-none tracking-[-2px] text-transparent [-webkit-text-stroke:2px_#f6b9cd] max-[991px]:text-[64px]">
                  {current.num}
                </div>
                <p className="m-0 text-[25.6px] font-medium leading-[1.3] text-[#111827] max-[991px]:text-[21.6px]">
                  {current.title}
                </p>
                <p className="m-0 text-[17.6px] leading-[1.65] text-[#4b5563]">{current.text}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-10">
          <LiveButton to="/marketing-services" variant="pink">
            Explore Our Marketing Services
          </LiveButton>
        </div>
      </LiveContainer>
    </section>
  )
}
