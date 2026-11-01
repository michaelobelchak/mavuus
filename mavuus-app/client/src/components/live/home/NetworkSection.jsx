import { Users } from 'lucide-react'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import CountUp from '../ui/CountUp'
import { BODY, Eyebrow, H_SECTION, H_SMALL, Highlight, Label } from '../ui/Typography'
import CompanyLogos from './CompanyLogos'

const CARDS = [
  {
    badge: <CountUp value="1,100+" className="font-bold text-brand-blue" />,
    title: 'Senior Marketing Leaders',
    text: 'A growing network of experienced marketing professionals across industries and organizations.',
  },
  {
    badge: (
      <Users
        aria-hidden="true"
        strokeWidth={1.8}
        className="size-9 text-brand-blue transition-transform duration-500 ease-[var(--ease-live)] group-hover:-rotate-6 group-hover:scale-110 motion-reduce:group-hover:transform-none"
      />
    ),
    title: 'Experienced Executive Network',
    text: 'CMOs, VPs of Marketing, fractional executives and senior marketing consultants sharing their expertise and perspectives.',
  },
]

export default function NetworkSection() {
  return (
    <Section>
      <div className="grid grid-cols-[1.1fr_1fr] items-center gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-12">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow>Our Marketing Leadership Network</Eyebrow>
          <h2 className={`${H_SECTION} m-0`}>
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
        </Reveal>
        <div className="flex flex-col gap-4">
          <Label as="p" className="m-0">Our Community at a Glance</Label>
          {CARDS.map((card, i) => (
            <Reveal key={card.title} index={i}>
              <Card rule interactive className="group flex items-center gap-6 px-7 py-6 max-[479px]:flex-col max-[479px]:items-start max-[479px]:gap-4">
                <div className="flex h-20 w-28 flex-none items-center justify-center rounded-xl bg-live-pink-50 text-[28px] leading-none font-semibold">
                  {card.badge}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className={`${H_SMALL} m-0`}>{card.title}</h3>
                  <p className="m-0 text-[15px] leading-6 text-live-grey">{card.text}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
      <CompanyLogos />
    </Section>
  )
}
