import { Link } from 'react-router-dom'

const footerLinks = {
  Platform: [
    { label: 'Academy', path: '/dashboard' },
    { label: 'Live Sessions', path: '/dashboard/live-sessions' },
    { label: 'On-Demand Videos', path: '/dashboard/on-demand' },
    { label: 'Community', path: '/dashboard/resources' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ],
  Resources: [
    { label: 'Blog', path: '#' },
    { label: 'Help Center', path: '#' },
    { label: 'Terms of Service', path: '#' },
    { label: 'Privacy Policy', path: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative bg-dark-blue text-white overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[400px] bg-brand-pink/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-[29px] h-[31px] transition-transform group-hover:scale-110" />
              <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-[20px] brightness-0 invert" />
            </Link>
            <p className="text-neutral-300 text-sm leading-relaxed">
              The premier community for marketing leaders to connect, learn, and grow together.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4 text-white tracking-wide">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="relative text-sm text-neutral-300 hover:text-white transition-colors inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brand-pink after:transition-all hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Mavuus. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'Instagram'].map((platform) => (
              <a
                key={platform}
                href="#"
                className="relative text-neutral-300 hover:text-white text-sm transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brand-pink after:transition-all hover:after:w-full"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
