import { useState } from 'react'
import ChevronIcon from './ChevronIcon'
import RichText from './RichText'

// Webflow .faq2_accordion: closed by default, the chevron flips when open.
export default function FaqAccordion({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex cursor-pointer items-center justify-between gap-6 py-5 text-left max-md:py-4"
      >
        <span className="text-xl leading-[30px] font-semibold text-dark-blue">{question}</span>
        <span className="flex w-8 shrink-0 self-start max-md:w-7">
          <ChevronIcon className={`h-8 w-8 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <RichText html={answer} className="mb-4 max-w-[768px]" />
        </div>
      </div>
    </div>
  )
}
