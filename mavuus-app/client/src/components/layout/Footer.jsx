import { Link } from 'react-router-dom'
import { LIVE_LOGO } from './PublicHeader'

const COLUMNS = [
  {
    title: 'Links',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Membership', to: '/membership' },
      { label: 'About', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Sign Up', to: '/register' },
      { label: 'Terms & Conditions', to: '/terms-conditions/introduction' },
      { label: 'Privacy Policy', to: '/privacy-policy/introduction' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] text-dark-blue">
      <div className="px-10 max-md:px-5">
        <div className="mx-auto max-w-[1280px] pt-24 pb-10 max-[991px]:pt-[72px] max-[767px]:pt-14">
          <div className="grid grid-cols-[1fr_768px] gap-y-4 pb-16 max-[1199px]:grid-cols-[1fr_640px] max-[991px]:grid-cols-1 max-[991px]:gap-y-12 max-[767px]:pb-12">
            <div className="flex flex-col items-start gap-4">
              <Link to="/" aria-label="Mavuus home" className="block w-fit">
                <img src={LIVE_LOGO} alt="Mavuus" width="175" height="34" loading="lazy" className="block h-[34px] w-[175px]" />
              </Link>
              <p className="m-0 max-w-[300px] text-base leading-7 text-live-grey">
                Marketing strategy, execution and leadership for B2B growth.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-y-4 max-[767px]:gap-x-6 max-[479px]:grid-cols-1 max-[479px]:gap-y-10">
              {COLUMNS.map((col) => (
                <div key={col.title} className="flex flex-col items-start">
                  <h2 className="mb-3 text-xl leading-[1.4] font-medium">{col.title}</h2>
                  {col.links.map((l) => (
                    <Link key={l.label} to={l.to} className="py-2.5 text-base leading-6 font-medium text-live-grey transition-colors hover:text-brand-pink">
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="flex flex-col items-start">
                <h2 className="mb-3 text-xl leading-[1.4] font-medium">Get in Touch</h2>
                <p className="m-0 py-2.5 text-base leading-7 text-dark-blue">
                  Question or feedback? We would love to{' '}
                  <Link to="/contact" className="text-live-grey underline transition-colors hover:text-brand-pink">hear from you</Link>.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-live-line/60 pt-8 text-sm leading-6 text-live-grey">
            <span>&copy; {new Date().getFullYear()} Mavuus. All rights reserved.</span>
            <span className="flex gap-6">
              <Link to="/terms-conditions/introduction" className="py-2.5 hover:text-brand-pink">Terms</Link>
              <Link to="/privacy-policy/introduction" className="py-2.5 hover:text-brand-pink">Privacy</Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
