import { useId, useState } from 'react'
import ChevronIcon from './ChevronIcon'
import RichText from './RichText'
import { H_SMALL } from '../ui/Typography'

// One question in a FAQ list. Closed by default; the answer is out of the tab order until it opens.
export default function FaqAccordion({ question, answer }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-live-hairline">
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-q`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          className="group flex min-h-11 w-full cursor-pointer items-start justify-between gap-6 py-5 text-left max-md:py-4"
        >
          <span className={`${H_SMALL} transition-colors duration-200 group-hover:text-brand-blue`}>{question}</span>
          <ChevronIcon
            className={`size-7 shrink-0 text-dark-blue transition-transform duration-300 ease-[var(--ease-live)] motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-live)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <RichText html={answer} className="pb-6" />
        </div>
      </div>
    </div>
  )
}
