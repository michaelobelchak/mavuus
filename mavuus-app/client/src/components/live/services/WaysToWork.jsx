import LiveButton from '../LiveButton'
import Card from '../ui/Card'
import NumberedTabs from '../ui/NumberedTabs'
import Reveal from '../ui/Reveal'
import Section from '../ui/Section'
import { BODY, Eyebrow, H_CARD, H_SECTION, Highlight, LEAD, SECTION_HEAD } from '../ui/Typography'
import { ENGAGEMENT_MODELS } from '../../../data/live/services'

function renderPanel(model) {
  return (
    <>
      <p className="m-0 text-[25.6px] leading-[1.3] font-medium text-dark-blue max-[991px]:text-[21.6px]">{model.question}</p>
      {model.paragraphs.map((text) => (
        <p key={text} className={`m-0 max-w-[68ch] ${LEAD}`}>{text}</p>
      ))}
    </>
  )
}

export default function WaysToWork() {
  return (
    <Section>
      <Reveal className={`mb-12 ${SECTION_HEAD}`}>
        <Eyebrow>Ways to Work Together</Eyebrow>
        <h2 className={`m-0 ${H_SECTION}`}>
          Flexible Support. <Highlight>Built Around Your Business.</Highlight>
        </h2>
        <p className={`m-0 ${LEAD}`}>
          Every organization has different marketing needs, priorities and internal capabilities. Whether you need strategic guidance, an experienced team to execute your marketing initiatives or support building your own marketing function, Mavuus can meet you where you are.
        </p>
      </Reveal>

      <Reveal>
        <NumberedTabs
          label="Ways to work together"
          items={ENGAGEMENT_MODELS}
          scaleStart="Strategic guidance"
          scaleEnd="Full-service support"
          initial={0}
          renderPanel={renderPanel}
        />
      </Reveal>

      <Reveal>
        <Card variant="feature" rule className="mt-12 flex items-center justify-between gap-x-8 gap-y-6 px-10 py-8 max-[1199px]:flex-col max-[1199px]:items-start max-[767px]:p-6">
          <div className="flex max-w-[640px] flex-col gap-2">
            <h3 className={`m-0 ${H_CARD}`}>Not sure which approach is right for your business?</h3>
            <p className={`m-0 ${BODY}`}>
              Let&apos;s discuss your priorities, existing capabilities and growth objectives to determine the right level of support.
            </p>
          </div>
          <LiveButton to="/contact" className="shrink-0 min-[768px]:whitespace-nowrap">Let&apos;s Talk About Your Marketing</LiveButton>
        </Card>
      </Reveal>
    </Section>
  )
}
