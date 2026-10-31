import { useState } from 'react'
import { Link } from 'react-router-dom'
import LiveContainer from '../LiveContainer'
import ChevronIcon from './ChevronIcon'

const CURRENT_MARKER = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/66b585daa5cd02f72e6dda19_dropdown.png'

// Webflow .faq-col-grid: "Categories" card on the left (collapsible under 992px) and content on the right.
export default function CategoryLayout({ items, current, children }) {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <LiveContainer innerClassName="py-24">
        <div className="py-16 max-[991px]:py-24">
          <div className="grid grid-cols-[1fr_2fr] gap-10 max-[991px]:flex max-[991px]:flex-col max-[479px]:gap-8">
            <div className="flex flex-col gap-8 bg-white p-8 max-[991px]:rounded-2xl max-[991px]:border max-[991px]:border-black max-[991px]:pb-0">
              <h3 className="text-[26px] leading-[33px] font-medium max-md:text-2xl">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className="flex w-full cursor-default items-center justify-between text-left max-[991px]:cursor-pointer"
                >
                  Categories
                  <ChevronIcon
                    className={`hidden h-8 w-8 transition-transform duration-300 max-[991px]:block ${open ? 'rotate-180' : ''}`}
                  />
                </button>
              </h3>
              <div
                className={`grid transition-[grid-template-rows] duration-300 min-[992px]:grid-rows-[1fr] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <ul className="flex flex-col gap-[25.6px]">
                    {items.map((item) => {
                      const isCurrent = item.slug === current
                      return (
                        <li key={item.slug}>
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            aria-current={isCurrent ? 'page' : undefined}
                            className={`inline-block max-w-full text-base leading-6 font-medium text-black no-underline transition-all duration-300 hover:pl-[11.2px] ${isCurrent ? 'bg-left bg-no-repeat pl-[11.2px]' : ''}`}
                            style={isCurrent ? { backgroundImage: `url("${CURRENT_MARKER}")` } : undefined}
                          >
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="h-8" />
                </div>
              </div>
            </div>
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
