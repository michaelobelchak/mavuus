import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from './SiteFooter'

function renderFooter(props) {
  return render(
    <MemoryRouter>
      <SiteFooter {...props} />
    </MemoryRouter>,
  )
}

describe('SiteFooter', () => {
  it('should render a contentinfo landmark with the logo linking home', () => {
    renderFooter()
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Mavuus home' })).toHaveAttribute('href', '/')
  })

  it('should list each column under its heading with the live site links', () => {
    renderFooter()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Links',
      'Resources',
      'Get in Touch',
    ])
    const links = screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
    expect(links).toEqual(
      expect.arrayContaining([
        ['Home', '/'],
        ['Membership', '/membership'],
        ['About', '/about'],
        ['Contact Us', '/contact'],
        ['FAQ', '/faq'],
        ['Sign Up', '/register'],
        ['Terms & Conditions', '/terms-conditions/introduction'],
        ['Privacy Policy', '/privacy-policy/introduction'],
        ['hear from you', '/contact'],
        ['Terms', '/terms-conditions/introduction'],
        ['Privacy', '/privacy-policy/introduction'],
      ]),
    )
  })

  it('should show the copyright with the current year', () => {
    renderFooter()
    expect(screen.getByText(`© ${new Date().getFullYear()} Mavuus. All rights reserved.`)).toBeInTheDocument()
  })

  it('should take custom columns', () => {
    renderFooter({ columns: [{ title: 'Company', links: [{ label: 'Careers', to: '/careers' }] }] })
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Careers' })).toHaveAttribute('href', '/careers')
  })
})
