import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CTABand } from './CTABand'

function renderBand(props) {
  return render(
    <MemoryRouter>
      <CTABand {...props} />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CTABand', () => {
  it('should render the default title, text and Get Started link to sign up', () => {
    renderBand()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ready to experience the real power of your Marketing Network?' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Connect with like-minded marketers/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register')
  })

  it('should take a custom title, text and button', () => {
    renderBand({ title: 'Hire a vetted vendor', text: 'Tell us what you need.', buttonLabel: 'Contact us', buttonTo: '/contact' })
    expect(screen.getByRole('heading', { name: 'Hire a vetted vendor' })).toBeInTheDocument()
    expect(screen.getByText('Tell us what you need.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact')
  })

  it('should widen the content column when wide', () => {
    const { rerender } = renderBand()
    const column = () => screen.getByRole('heading').parentElement
    expect(column()).toHaveClass('max-w-150')
    rerender(
      <MemoryRouter>
        <CTABand wide />
      </MemoryRouter>,
    )
    expect(column()).toHaveClass('max-w-220')
  })
})
