import { Check } from 'lucide-react'
import Reveal from './Reveal'

// The one checklist style for the public site. Items reveal in sequence.
export default function CheckList({ items, size = 'md', className = '' }) {
  const text = size === 'sm' ? 'text-[15px] leading-6' : 'text-base leading-7'
  return (
    <ul className={`m-0 flex list-none flex-col gap-3 p-0 ${className}`}>
      {items.map((item, i) => (
        <Reveal as="li" key={typeof item === 'string' ? item : i} index={i} className={`flex items-start gap-3 text-dark-blue ${text}`}>
          <span aria-hidden="true" className="mt-[3px] flex size-[22px] shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
            <Check size={13} strokeWidth={3} />
          </span>
          <span>{item}</span>
        </Reveal>
      ))}
    </ul>
  )
}
