import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SiteSkipLink } from './SiteSkipLink'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteSkipLink />
    </MemoryRouter>,
  )
}

describe('SiteSkipLink', () => {
  it.each(['/', '/membership', '/login', '/dashboarding', '/administrator'])('should render on %s', (path) => {
    renderAt(path)
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
  })

  it.each(['/dashboard', '/dashboard/jobs/4', '/admin', '/admin/users'])('should leave %s to the app shell', (path) => {
    renderAt(path)
    expect(screen.queryByRole('link', { name: 'Skip to main content' })).not.toBeInTheDocument()
  })
})
