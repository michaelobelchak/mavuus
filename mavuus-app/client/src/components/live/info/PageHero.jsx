import LiveContainer from '../LiveContainer'
import Reveal from '../ui/Reveal'
import { H_DISPLAY, H_PAGE, LEAD } from '../ui/Typography'

// The opening block on About, Contact, Membership, FAQ and the legal pages.
// `display` uses the larger Persuade-page heading; Read pages (FAQ, legal) use the page heading.
export default function PageHero({ title, lead, display = false }) {
  return (
    <LiveContainer as="section" innerClassName="pt-20 pb-2 max-[991px]:pt-16 max-[767px]:pt-10">
      <Reveal className="mx-auto flex max-w-[960px] flex-col items-center gap-5 text-center">
        <h1 className={`m-0 ${display ? H_DISPLAY : H_PAGE}`}>{title}</h1>
        {lead && <p className={`m-0 max-w-[768px] ${LEAD}`}>{lead}</p>}
      </Reveal>
    </LiveContainer>
  )
}
