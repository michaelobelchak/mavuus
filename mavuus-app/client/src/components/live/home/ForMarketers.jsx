import LiveContainer from '../LiveContainer'
import { BODY, Eyebrow, H2, OutlineButton } from './shared'
import { MARKETERS_IMAGE, MARKETERS_LIST } from '../../../data/live/home'

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11.6597" cy="12.4265" r="10.6597" fill="#1F648D" />
      <path
        d="M16.5043 8.76745C16.3028 8.77351 16.1112 8.85834 15.971 9.00377C14.0465 10.9328 11.9864 13.143 10.0634 15.0931L7.31862 12.8331C7.16335 12.6809 6.95129 12.6006 6.73392 12.612C6.5173 12.6241 6.31507 12.7263 6.17648 12.8945C6.03863 13.0619 5.97729 13.28 6.00758 13.4959C6.03863 13.711 6.15754 13.9033 6.33704 14.0268L9.6332 16.7413C9.94145 16.9958 10.3921 16.9746 10.6754 16.6928C12.7597 14.604 15.0213 12.1575 17.0738 10.1005C17.3056 9.8763 17.3745 9.53319 17.248 9.23781C17.1215 8.94168 16.8261 8.7546 16.5043 8.76747L16.5043 8.76745Z"
        fill="white"
      />
    </svg>
  )
}

export default function ForMarketers() {
  return (
    <section>
      <LiveContainer innerClassName="py-24 max-[767px]:py-14">
        <Eyebrow className="mb-4">For Marketing Leaders</Eyebrow>
        <h2 className={`${H2} mb-8`}>Connect. Learn. Lead.</h2>
        <div className="grid grid-cols-2 items-center gap-x-16 gap-y-1 max-[991px]:grid-cols-1 max-[991px]:gap-y-16 max-[767px]:gap-y-12">
          <div className="max-[991px]:order-last">
            <img
              src={MARKETERS_IMAGE.src}
              srcSet={MARKETERS_IMAGE.srcSet}
              sizes="(max-width: 479px) 100vw, 49vw"
              width="608"
              height="608"
              loading="lazy"
              alt="Grid of Mavuus community members around the Mavuus logo"
              className="inline-block h-auto w-full max-w-full"
            />
          </div>
          <div>
            <div className="mb-8 max-[767px]:mb-5">
              <h6 className="m-0 text-lg font-bold leading-[27px] max-[767px]:text-sm max-[767px]:leading-[1.5]">
                Great marketing leadership doesn&apos;t happen in isolation.
              </h6>
              <p className={`${BODY} mt-3`}>
                Mavuus brings together senior marketing professionals who believe in learning from one another,
                exchanging ideas and building meaningful professional relationships.
              </p>
            </div>
            <h4 className="mb-4 text-[21.6px] font-medium leading-[1.4] max-[767px]:text-[22.4px]">Join our community to:</h4>
            <ul className="m-0 mb-12 grid list-none grid-cols-1 gap-4 p-0 py-2 max-[767px]:mb-6">
              {MARKETERS_LIST.map((item) => (
                <li key={item} className="flex">
                  <div className="mr-4 flex-none self-start">
                    <CheckIcon />
                  </div>
                  <p className="m-0">{item}</p>
                </li>
              ))}
            </ul>
            <p className={`${BODY} mb-8`}>
              Whether you&apos;re navigating new leadership challenges, exploring fresh perspectives or simply looking to
              connect with peers who understand your world, Mavuus provides a place to learn and grow together.
            </p>
            <OutlineButton to="/register">Join the CMO Community</OutlineButton>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
