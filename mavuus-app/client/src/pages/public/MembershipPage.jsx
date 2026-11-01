import LiveButton from '../../components/live/LiveButton'
import CTABand from '../../components/live/CTABand'
import PageHero from '../../components/live/info/PageHero'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import CheckList from '../../components/live/ui/CheckList'
import { cardClass } from '../../components/live/ui/cardStyles'
import { H_CARD, H_SECTION, Highlight, LEAD } from '../../components/live/ui/Typography'
import { MEMBER_BENEFITS } from '../../data/live/membership'

export default function MembershipPage() {
  return (
    <>
      <PageHero
        display
        title={
          <>
            <Highlight>Collaborate</Highlight> with peers. <Highlight>Learn</Highlight> from the experts.{' '}
            <Highlight>Exchange</Highlight> contractors. <Highlight>Land</Highlight> clients.
          </>
        }
      />

      <Section>
        <Reveal
          className={cardClass({
            variant: 'panel',
            className:
              'grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-16 px-14 py-14 max-[1199px]:gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-10 max-[767px]:px-6 max-[767px]:py-10',
          })}
        >
          <div className="flex flex-col items-start gap-5">
            <h2 className={`m-0 ${H_SECTION}`}>Become a member</h2>
            <p className={`m-0 ${LEAD}`}>We are on a mission to help CMOs increase their C-suite impact.</p>
            <p className="m-0 text-lg leading-7 font-semibold text-brand-blue">Start with a free 30-day trial.</p>
            <LiveButton to="/register" className="mt-3 whitespace-nowrap">Join Mavuus Community</LiveButton>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className={`m-0 ${H_CARD}`}>Join 1,100+ other marketing leaders to:</h3>
            <CheckList items={MEMBER_BENEFITS} />
          </div>
        </Reveal>
      </Section>

      <CTABand />
    </>
  )
}
