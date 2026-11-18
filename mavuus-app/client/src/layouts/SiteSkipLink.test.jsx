import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useShellMounted } from './shellPresence'
import { SiteSkipLink } from './SiteSkipLink'

// Stands in for ShellLayout: AppShell brings its own skip link.
function FakeShell() {
  useShellMounted()
  return <a href="#main-content">Skip to main content</a>
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteSkipLink />
      <Routes>
        <Route path="/dashboard" element={<FakeShell />} />
        <Route path="/admin/users" element={<FakeShell />} />
        <Route path="*" element={<main id="main-content">Not found</main>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SiteSkipLink', () => {
  it.each(['/', '/login', '/dashboard/nope', '/admin/missing/page'])(
    'should render one skip link on %s, where no shell is mounted',
    (path) => {
      renderAt(path)
      const links = screen.getAllByRole('link', { name: 'Skip to main content' })
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveClass('skip-to-main')
    },
  )

  it.each(['/dashboard', '/admin/users'])('should leave %s to the shell, so there is still exactly one', (path) => {
    renderAt(path)
    const links = screen.getAllByRole('link', { name: 'Skip to main content' })
    expect(links).toHaveLength(1)
    expect(links[0]).not.toHaveClass('skip-to-main')
  })
})
