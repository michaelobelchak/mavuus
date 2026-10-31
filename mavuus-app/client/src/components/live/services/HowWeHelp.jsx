import { SERVICE_CARDS } from '../../../data/live/services'
import { CheckItem, Eyebrow, H2_CLASS, Highlight, LABEL_CLASS } from './ServiceBits'

const SPAN = {
  third: 'col-span-2 max-[991px]:col-span-1',
  half: 'col-span-3 max-[991px]:col-span-2 max-[767px]:col-span-1',
}

function ServiceCard({ card }) {
  const twoCol = card.size === 'half'
  return (
    <div
      className={`group/card relative flex flex-col gap-[14.4px] rounded-3xl border border-white/70 bg-white/38 p-8 opacity-62 shadow-[0_8px_24px_rgba(17,24,39,0.04)] backdrop-blur-[14px] transition-all duration-450 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/grid:opacity-45 hover:-translate-y-1.5 hover:!border-[rgba(240,111,154,0.45)] hover:!bg-white/96 hover:!opacity-100 hover:!shadow-[0_26px_54px_rgba(240,111,154,0.18)] [@media(hover:none)]:!bg-white/85 [@media(hover:none)]:!opacity-100 ${SPAN[card.size]}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-[13.6px] bg-white/70 font-semibold text-[#e85a8a] transition-all duration-450 group-hover/card:bg-[#f06f9a] group-hover/card:text-white">
          {card.num}
        </span>
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full text-base text-[#9ca3af] transition-all duration-450 group-hover/card:rotate-45 group-hover/card:bg-[#f06f9a] group-hover/card:text-white"
        >
          ↗
        </span>
      </div>
      <h3 className="text-[21.6px] leading-[1.3] font-medium text-[#111827]">{card.title}</h3>
      <p className="text-base leading-[1.6] text-[#4b5563]">{card.text}</p>
      <div className={`mt-2 ${LABEL_CLASS}`}>{card.label}</div>
      <ul className={twoCol ? 'grid grid-cols-2 gap-x-6 gap-y-2 max-[767px]:grid-cols-1' : 'flex flex-col gap-2'}>
        {card.items.map((item) => (
          <CheckItem key={item}>{item}</CheckItem>
        ))}
      </ul>
      {card.note && (
        <p className="border-t border-black/8 pt-[14.4px] text-[15.2px] leading-[28.8px] text-[#4b5563] italic">
          {card.note}
        </p>
      )}
    </div>
  )
}

export default function HowWeHelp() {
  return (
    <section id="how-we-help" className="overflow-x-clip">
      <div className="px-10 max-[767px]:px-5">
        <div className="mx-auto w-full max-w-[1280px] py-24 max-[767px]:py-14">
          <div className="mb-12 flex max-w-[736px] flex-col gap-3">
            <Eyebrow>How We Help</Eyebrow>
            <h2 className={H2_CLASS}>
              From Strategy to <Highlight>Execution</Highlight>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute -top-16 left-[8%] z-0 size-[416px] rounded-full bg-[#f8a5c2] opacity-55 blur-[70px]" />
            <div className="absolute right-[6%] -bottom-16 z-0 size-[448px] rounded-full bg-[#9cc3dd] opacity-55 blur-[70px]" />
            <div className="group/grid relative z-[1] grid grid-cols-6 gap-6 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {SERVICE_CARDS.map((card) => (
                <ServiceCard key={card.num} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
