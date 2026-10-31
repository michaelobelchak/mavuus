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
    <footer className="text-dark-blue">
      <div className="px-10 max-md:px-5">
        <div className="mx-auto max-w-[1280px] py-24">
          <div className="pb-12 pt-20 max-[991px]:pt-16 max-[767px]:pt-12">
            <div className="pb-20 max-[991px]:pb-16 max-[767px]:pb-12">
              <div className="grid grid-cols-[512px_768px] gap-y-4 max-[991px]:grid-cols-1 max-[991px]:gap-y-16 max-[767px]:gap-y-12">
                <div>
                  <Link to="/" aria-label="Mavuus home" className="block w-fit">
                    <img src={LIVE_LOGO} alt="Mavuus" loading="lazy" className="block h-[34px] w-[175px]" />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-y-4 max-[767px]:gap-x-6 max-[479px]:grid-cols-1 max-[479px]:gap-y-10">
                  {COLUMNS.map((col) => (
                    <div key={col.title} className="flex flex-col items-start">
                      <h4 className="mb-4 text-2xl leading-[33.6px] max-[767px]:text-xl max-[767px]:leading-7">{col.title}</h4>
                      {col.links.map((l) => (
                        <Link key={l.label} to={l.to} className="py-[6.4px] text-base font-medium text-live-grey hover:text-dark-blue">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <div className="flex flex-col items-start">
                    <h4 className="mb-4 text-2xl leading-[33.6px] max-[767px]:text-xl max-[767px]:leading-7">Get in Touch</h4>
                    <div>
                      Question or feedback? We would love to{' '}
                      <Link to="/contact" className="text-live-grey underline">hear from you</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px bg-live-line" />
          </div>
        </div>
      </div>
    </footer>
  )
}
