import LiveButton from '../../components/live/LiveButton'
import { CHECK_ICON, MEMBER_BENEFITS } from '../../data/live/membership'

const HIGHLIGHT = 'font-bold text-brand-blue'

export default function MembershipPage() {
  return (
    <>
      <section className="flex flex-col justify-center max-[991px]:pt-12 max-[767px]:pt-4 max-[479px]:pt-8">
        <div className="px-10 max-[767px]:px-5 max-[479px]:pt-16">
          <div className="mx-auto w-full max-w-[1280px] py-24">
            <div className="flex flex-col items-center gap-12 text-center">
              <div className="flex max-w-[1120px] flex-col items-center gap-8 pt-8">
                <h1 className="text-[40px] leading-[48px] font-medium text-black">
                  <span className={HIGHLIGHT}>Collaborate</span> with peers.{' '}
                  <span className={HIGHLIGHT}>Learn</span> from the experts.{' '}
                  <span className={HIGHLIGHT}>Exchange</span> contractors.{' '}
                  <span className={HIGHLIGHT}>Land</span> clients.
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="px-10 max-[767px]:px-5">
          <div className="mx-auto w-full max-w-[1280px] py-24">
            <div className="py-16 max-[991px]:py-24">
              <div className="flex items-center justify-between gap-[200px] rounded-[32px] bg-live-blue-light p-14 text-left max-[991px]:flex-col max-[991px]:items-start max-[991px]:gap-20 max-[767px]:px-8 max-[479px]:py-12">
                <div className="flex w-[310px] flex-col gap-12 max-[479px]:w-auto">
                  <div className="flex flex-col gap-8">
                    <h3 className="text-[26px] leading-[33px] font-medium text-dark-blue max-[767px]:text-2xl">
                      Become a member
                    </h3>
                    <div className="text-base leading-6 text-live-grey">
                      We are on a mission to help CMOs increase their C-suite impact.
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <LiveButton to="/register" className="w-full">Join Mavuus Community</LiveButton>
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <h5 className="text-xl leading-[30px] font-medium text-dark-blue max-[767px]:text-base max-[767px]:leading-6">
                    Join hundreds of other marketing leaders to:
                  </h5>
                  <ul className="flex flex-col gap-[20.8px]">
                    {MEMBER_BENEFITS.map((item) => (
                      <li key={item} className="flex gap-4 text-base leading-6 text-dark-blue">
                        <img src={CHECK_ICON} alt="" className="size-6 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
