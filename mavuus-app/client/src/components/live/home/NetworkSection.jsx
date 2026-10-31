import LiveContainer from '../LiveContainer'
import { BODY, CARD, Eyebrow, H2, Highlight } from './shared'

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-9 text-[#1d5c86] transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-[1.15]"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

const CARDS = [
  {
    badge: <span className="font-bold text-brand-blue">1,100+</span>,
    title: 'Senior Marketing Leaders',
    text: 'A growing network of experienced marketing professionals across industries and organizations.',
  },
  {
    badge: <PeopleIcon />,
    title: 'Experienced Executive Network',
    text: 'CMOs, VPs of Marketing, fractional executives and senior marketing consultants sharing their expertise and perspectives.',
  },
]

export default function NetworkSection() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-x-16 gap-y-12 max-[991px]:grid-cols-1">
          <div className="flex flex-col gap-y-4">
            <Eyebrow className="flex">Our Marketing Leadership Network</Eyebrow>
            <h2 className={`${H2} mb-8`}>
              Connected to Experienced <Highlight>Marketing Leaders</Highlight>
            </h2>
            <p className={`${BODY} m-0`}>
              Mavuus is more than a consulting practice. We&apos;ve built a community that brings together senior
              marketing executives, experienced practitioners and industry experts.
            </p>
            <p className={`${BODY} m-0`}>
              Our network creates opportunities for meaningful conversations, shared learning and professional
              connections while keeping us close to the challenges marketing leaders face every day.
            </p>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="text-sm font-semibold uppercase leading-[21px] tracking-[1px] text-[#6b7280]">
              Our Community at a Glance
            </div>
            {CARDS.map((card) => (
              <div
                key={card.title}
                className={`group flex items-center gap-x-6 px-7 py-6 max-[479px]:flex-col max-[479px]:items-start max-[479px]:gap-y-4 ${CARD}`}
              >
                <div className="flex h-20 w-28 flex-none items-center justify-center rounded-xl bg-[#fdf0f4] text-[28px] font-semibold leading-none">
                  {card.badge}
                </div>
                <div className="flex flex-col gap-y-[6.4px]">
                  <h3 className="m-0 text-base font-medium leading-6 max-[767px]:text-xs max-[767px]:leading-[18px]">{card.title}</h3>
                  <p className="m-0 text-[13.6px] leading-[20.4px]">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
