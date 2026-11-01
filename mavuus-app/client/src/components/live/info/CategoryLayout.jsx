import { useId, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import { cardClass } from '../ui/cardStyles'
import { H_CARD, H_SECTION } from '../ui/Typography'
import ChevronIcon from './ChevronIcon'

const COLLAPSIBLE = '(max-width: 991px)'

function subscribe(cb) {
  const mq = window.matchMedia(COLLAPSIBLE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getCollapsible = () => window.matchMedia(COLLAPSIBLE).matches

function CategoryLinks({ items, current, onPick }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((item) => {
        const isCurrent = item.slug === current
        return (
          <li key={item.slug}>
            <Link
              to={item.to}
              onClick={onPick}
              aria-current={isCurrent ? 'page' : undefined}
              className={`relative -mx-3 flex min-h-11 items-center rounded-xl px-3 py-2.5 text-base leading-6 no-underline transition-colors duration-200 ${
                isCurrent
                  ? 'bg-live-pink-50 font-semibold text-dark-blue before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-pink'
                  : 'font-medium text-live-grey hover:bg-live-blue-light hover:text-dark-blue'
              }`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * FAQ category and legal page layout: a "Categories" card beside the content.
 * Under 992px the card collapses behind a toggle, and the hidden list is inert.
 */
export default function CategoryLayout({ items, current, heading, children }) {
  const [open, setOpen] = useState(false)
  const collapsible = useSyncExternalStore(subscribe, getCollapsible, () => false)
  const id = useId()
  const hidden = collapsible && !open

  return (
    <Section>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-8">
        <nav aria-labelledby={`${id}-title`} className={cardClass({ variant: 'surface', className: 'p-6' })}>
          <h2 id={`${id}-title`} className={`m-0 ${H_CARD}`}>
            {collapsible ? (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={`${id}-list`}
                className="-my-2 flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                Categories
                <ChevronIcon
                  className={`size-8 shrink-0 transition-transform duration-300 ease-[var(--ease-live)] motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                />
              </button>
            ) : (
              'Categories'
            )}
          </h2>
          <div
            id={`${id}-list`}
            inert={hidden}
            className={collapsible ? `grid transition-[grid-template-rows] duration-300 ease-[var(--ease-live)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}` : ''}
          >
            <div className={collapsible ? '-mx-3 overflow-hidden px-3' : ''}>
              <div className="pt-5">
                <CategoryLinks items={items} current={current} onPick={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </nav>

        <div className="flex min-w-0 flex-col gap-6">
          <Reveal key={current} as="h2" className={`m-0 ${H_SECTION}`}>{heading}</Reveal>
          {children}
        </div>
      </div>
    </Section>
  )
}
