import { useEffect, useState } from 'react'
import LiveButton from '../LiveButton'
import { ENGAGEMENT_MODELS } from '../../../data/live/services'
import { Eyebrow, H2_CLASS, Highlight, LABEL_CLASS } from './ServiceBits'

export default function WaysToWork() {
  const [active, setActive] = useState(1)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return undefined
    const id = setInterval(() => setActive((n) => (n % ENGAGEMENT_MODELS.length) + 1), 5000)
    return () => clearInterval(id)
  }, [autoplay])

  const select = (n) => {
    setAutoplay(false)
    setActive(n)
  }

  const panel = ENGAGEMENT_MODELS[active - 1]

  return (
    <section>
      <div className="px-10 max-[767px]:px-5">
        <div className="mx-auto w-full max-w-[1280px] py-24 max-[767px]:py-14">
          <div className="mb-12 flex max-w-[736px] flex-col gap-3">
            <Eyebrow>Ways to Work Together</Eyebrow>
            <h2 className={H2_CLASS}>
              Flexible Support. <Highlight>Built Around Your Business.</Highlight>
            </h2>
            <p className="text-xl leading-[28.8px] text-live-grey">
              Every organization has different marketing needs, priorities and internal capabilities. Whether you need strategic guidance, an experienced team to execute your marketing initiatives or support building your own marketing function, Mavuus can meet you where you are.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-x-4 max-[479px]:flex-wrap">
              <span className={`shrink-0 ${LABEL_CLASS}`}>Strategic guidance</span>
              <div className="relative h-1.5 grow overflow-hidden rounded-full bg-[#e5e7eb] max-[479px]:order-3 max-[479px]:min-w-full">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-[linear-gradient(90deg,#9cc3dd,#f06f9a)] transition-[width] duration-500"
                  style={{ width: `${active * 25}%` }}
                />
              </div>
              <span className={`shrink-0 ${LABEL_CLASS}`}>Full-service support</span>
            </div>

            <div className="grid grid-cols-[1fr_1.25fr] items-start gap-x-16 gap-y-8 max-[991px]:grid-cols-1">
              <div className="flex flex-col border-l-2 border-[#e5e7eb]" role="tablist" aria-label="Ways to work together">
                {ENGAGEMENT_MODELS.map((model, i) => {
                  const n = i + 1
                  const isActive = n === active
                  return (
                    <button
                      key={model.num}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => select(n)}
                      onMouseEnter={() => select(n)}
                      className={`group -ml-0.5 flex cursor-pointer items-start gap-x-5 border-l-2 py-5 pr-4 pl-6 text-left transition-all duration-250 ${
                        isActive
                          ? 'border-[#f06f9a] bg-[linear-gradient(90deg,rgba(240,111,154,0.08),transparent)]'
                          : 'border-transparent'
                      }`}
                    >
                      <span className={`text-[17.6px] leading-[1.4] font-semibold transition-colors duration-250 ${isActive ? 'text-[#f06f9a]' : 'text-[#9ca3af]'}`}>
                        {model.num}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className={`text-xl leading-[1.3] font-medium transition-colors duration-250 group-hover:text-[#111827] ${isActive ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                          {model.title}
                        </span>
                        <span className={`text-[15.2px] leading-[22.8px] ${isActive ? 'text-[#e85a8a]' : 'text-[#9ca3af]'}`}>
                          {model.tag}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div key={active} role="tabpanel" className="flex animate-[fadeIn_0.4s_ease] flex-col gap-4 pt-2">
                <div className="text-[96px] leading-none font-semibold tracking-[-2px] text-transparent [-webkit-text-stroke:2px_#f6b9cd] max-[991px]:text-[64px]">
                  {panel.num}
                </div>
                <p className="text-[25.6px] leading-[1.3] font-medium text-[#111827] max-[991px]:text-[21.6px]">{panel.question}</p>
                {panel.paragraphs.map((text) => (
                  <p key={text} className="text-[17.6px] leading-[1.65] text-[#4b5563]">{text}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 rounded-[20px] border-l-4 border-[#f06f9a] bg-white px-10 py-8 shadow-[0_12px_32px_rgba(17,24,39,0.06)] max-[767px]:p-6">
            <div className="flex max-w-[640px] flex-col gap-2">
              <h3 className="text-xl leading-[1.5] font-medium text-dark-blue max-[767px]:text-sm">
                Not sure which approach is right for your business?
              </h3>
              <p className="text-base leading-[28.8px] text-live-grey">
                Let&apos;s discuss your priorities, existing capabilities and growth objectives to determine the right level of support.
              </p>
            </div>
            <LiveButton to="/contact">Let&apos;s Talk About Your Marketing</LiveButton>
          </div>
        </div>
      </div>
    </section>
  )
}
