import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CompanyLogo } from './CompanyLogo'

describe('CompanyLogo', () => {
  it('should show the image as decoration when given src', () => {
    const { container } = render(<CompanyLogo name="Northwind Growth" src="/logo.png" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('src', '/logo.png')
  })

  it('should show initials when there is no src or the image fails', () => {
    const { container, rerender } = render(<CompanyLogo name="Northwind Growth" />)
    expect(container).toHaveTextContent('NG')
    rerender(<CompanyLogo name="TechFlow" src="/broken.png" />)
    fireEvent.error(container.querySelector('img'))
    expect(container).toHaveTextContent('TE')
  })

  it('should be hidden from screen readers because the name is shown next to it', () => {
    const { container } = render(<CompanyLogo name="Lumen Creative" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('should show a building icon when there is no name', () => {
    const { container } = render(<CompanyLogo />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.queryByText(/\w/)).toBeNull()
  })
})
