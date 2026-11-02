import Card from '../ui/Card'
import CheckList from '../ui/CheckList'
import Reveal from '../ui/Reveal'
import Section from '../ui/Section'
import { BODY, Eyebrow, H_CARD, H_SECTION, Highlight, Label, SECTION_HEAD } from '../ui/Typography'
import { SERVICE_CARDS } from '../../../data/live/services'

// Desktop: 3 + 2 on a 6-column grid. Tablet: 01 and 02 share a row, 03 to 05 take full rows. Mobile: 1 column.
function layout(card) {
  if (card.size === 'half') {
    return { span: 'col-span-3 max-[991px]:col-span-2 max-[767px]:col-span-1', list: 'min-[768px]:grid min-[768px]:grid-cols-2 min-[768px]:gap-x-6' }
  }
  if (card.wideOnTablet) {
    return {
      span: 'col-span-2 max-[991px]:col-span-2 max-[767px]:col-span-1',
      list: 'min-[768px]:max-[991px]:grid min-[768px]:max-[991px]:grid-cols-2 min-[768px]:max-[991px]:gap-x-6',
    }
  }
  return { span: 'col-span-2 max-[991px]:col-span-1', list: '' }
}

function ServiceCard({ card, index }) {
  const { span, list } = layout(card)
  return (
    <Reveal index={index} className={`flex ${span}`}>
      <Card variant="feature" interactive className="flex w-full flex-col gap-4 p-8 max-[767px]:p-6">
        <span className="flex size-12 items-center justify-center rounded-xl bg-live-pink-50 font-semibold text-brand-pink tabular-nums">
          {card.num}
        </span>
        <h3 className={`m-0 ${H_CARD}`}>{card.title}</h3>
        <p className={`m-0 ${BODY}`}>{card.text}</p>
        <Label as="p" className="m-0 mt-2">{card.label}</Label>
        <CheckList items={card.items} size="sm" className={list} />
        {card.note && (
          <p className="m-0 mt-auto border-t border-live-track pt-4 text-[15px] leading-7 text-live-grey italic">{card.note}</p>
        )}
      </Card>
    </Reveal>
  )
}

export default function HowWeHelp() {
  return (
    <Section id="how-we-help" className="scroll-mt-24">
      <Reveal className={`mb-12 ${SECTION_HEAD}`}>
        <Eyebrow>How We Help</Eyebrow>
        <h2 className={`m-0 ${H_SECTION}`}>
          From Strategy to <Highlight>Execution</Highlight>
        </h2>
      </Reveal>
      <div className="grid grid-cols-6 gap-6 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
        {SERVICE_CARDS.map((card, i) => (
          <ServiceCard key={card.num} card={card} index={i} />
        ))}
      </div>
    </Section>
  )
}
