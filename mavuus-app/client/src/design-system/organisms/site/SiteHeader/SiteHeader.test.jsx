import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockViewport } from '../../../test/browserMocks'
import { tokens } from '../../../tokens/tokens.js'
import { SiteHeader } from './SiteHeader'

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
      <p>Page</p>
      <Where />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const menuButton = () => screen.getByRole('button', { name: /menu/ })

describe('SiteHeader', () => {
  it('should link the logo home and list the site pages, Login and Sign Up', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Mavuus home' })).toHaveAttribute('href', '/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Membership',
      'Services',
      'Resources',
      'About',
      'Contact Us',
    ])
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/register')
  })

  it('should mark the link for the current page active in pink', () => {
    renderHeader('/about')
    const about = within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'About' })
    expect(about).toHaveAttribute('aria-current', 'page')
    expect(about).toHaveClass('text-text-brand')
    expect(screen.getByRole('link', { name: 'Membership' })).not.toHaveAttribute('aria-current')
  })

  it('should open the menu, focus its first link and switch the button label', async () => {
    const user = userEvent.setup()
    renderHeader()
    const button = menuButton()
    expect(button).toHaveAccessibleName('Open menu')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAccessibleName('Close menu')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const menu = document.getElementById(button.getAttribute('aria-controls'))
    expect(menu).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: 'Membership' })).toHaveFocus()
    expect(within(menu).getByRole('link', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('should close the menu on Escape and return focus to the button', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())
    await user.keyboard('{Escape}')
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton()).toHaveFocus()
  })

  it('should close the menu on a click outside it', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())
    await user.click(screen.getByText('Page'))
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close the menu when a link in it is followed', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())
    const menu = document.getElementById(menuButton().getAttribute('aria-controls'))
    await user.click(within(menu).getByRole('link', { name: 'About' }))
    expect(screen.getByTestId('where')).toHaveTextContent('/about')
    await waitFor(() => expect(menuButton()).toHaveAttribute('aria-expanded', 'false'))
  })

  it('should close the menu when the button is pressed again', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())
    await user.click(menuButton())
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close the menu when the window grows past 1200px and keep it closed on the way back', async () => {
    const user = userEvent.setup()
    const viewport = mockViewport(390)
    renderHeader()
    await user.click(menuButton())
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true')
    act(() => viewport.resize(1440))
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
    act(() => viewport.resize(390))
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(menuButton().getAttribute('aria-controls'))).not.toBeInTheDocument()
  })

  it('should close the menu exactly at the site-lg breakpoint token', async () => {
    const user = userEvent.setup()
    const siteLg = Number.parseFloat(tokens['ds-breakpoint-site-lg'])
    const viewport = mockViewport(siteLg - 1)
    renderHeader()
    await user.click(menuButton())
    act(() => viewport.resize(siteLg - 1))
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true')
    act(() => viewport.resize(siteLg))
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })
})
