import { useState, useEffect } from 'react'
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
  const [settings, setSettings] = useState({})

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setSettings)
      .catch(() => {})
  }, [])

  return (
    <footer className="bg-dark-blue text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-[29px] h-[31px]" />
              <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-[20px] brightness-0 invert" />
            </Link>
            <p className="text-neutral-300 text-sm leading-relaxed">
              The premier community for marketing leaders to connect, learn, and grow together.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4 text-white">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-neutral-300 hover:text-white transition-colors"
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
          <p className="text-sm text-neutral-300">
            &copy; {new Date().getFullYear()} Mavuus. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href={settings.social_twitter || '#'} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white text-sm">Twitter</a>
            <a href={settings.social_linkedin || '#'} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white text-sm">LinkedIn</a>
            <a href={settings.social_instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white text-sm">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
