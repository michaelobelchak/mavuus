// Links the public header and footer share. Paths mirror the live mavuus.com URLs.
export const SITE_NAV_LINKS = [
  { label: 'Membership', to: '/membership' },
  { label: 'Services', to: '/marketing-services' },
  { label: 'Resources', to: '/resources' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

export const SITE_FOOTER_COLUMNS = [
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
