import { act, render, screen } from '@testing-library/react'
import { useLocation, useParams } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuth } from '../src/context/AuthContext'
import { storyUser, withAuth, withLayout, withRouter, withTheme, withToaster } from './decorators'

function decorate(decorator, Story, context = {}) {
  const Decorated = () => decorator(Story, { parameters: {}, globals: {}, ...context })
  return render(<Decorated />)
}

function Where() {
  const location = useLocation()
  const params = useParams()
  return (
    <p>
      {location.pathname} {params.id ?? 'none'}
    </p>
  )
}

afterEach(() => {
  delete document.documentElement.dataset.theme
})

describe('withRouter', () => {
  it('should start at / when the story sets no router parameter', () => {
    decorate(withRouter, Where)
    expect(screen.getByText('/ none')).toBeInTheDocument()
  })

  it('should start at initialEntries and match the route path when parameters.router is set', () => {
    decorate(withRouter, Where, { parameters: { router: { initialEntries: ['/jobs/42'], path: '/jobs/:id' } } })
    expect(screen.getByText('/jobs/42 42')).toBeInTheDocument()
  })
})

describe('withTheme', () => {
  it('should set data-theme on the document element from the theme global', () => {
    decorate(withTheme, () => <p>story</p>, { globals: { theme: 'dark' } })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('should fall back to light when the theme global is unknown', () => {
    decorate(withTheme, () => <p>story</p>, { globals: { theme: 'sepia' } })
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('withLayout', () => {
  it('should pad the story without painting a background when the layout is padded', () => {
    const { container } = decorate(withLayout, () => <p>story</p>, { parameters: { layout: 'padded' } })
    expect(container.firstChild).toHaveClass('p-ds-lg')
    expect(container.firstChild.className).not.toMatch(/bg-/)
  })

  it('should skip the padding wrapper when the layout is fullscreen', () => {
    const { container } = decorate(withLayout, () => <p>story</p>, { parameters: { layout: 'fullscreen' } })
    expect(container.firstChild.tagName).toBe('P')
  })
})

describe('withToaster', () => {
  it('should render the story next to the design-system Toaster', () => {
    const { container } = decorate(withToaster, () => <p>story</p>)
    expect(screen.getByText('story')).toBeInTheDocument()
    expect(container.querySelector('section[aria-label]')).not.toBeNull()
  })
})

describe('withAuth', () => {
  function Account() {
    const { user, isAuthenticated, loading, updateUser, logout } = useAuth()
    return (
      <div>
        <p>{isAuthenticated ? user.name : 'signed out'}</p>
        <p>{loading ? 'loading' : 'ready'}</p>
        <button type="button" onClick={() => updateUser({ name: 'Renamed' })}>
          rename
        </button>
        <button type="button" onClick={() => logout()}>
          sign out
        </button>
      </div>
    )
  }

  it('should provide the story user with the AuthProvider value shape and no loading state', () => {
    decorate(withAuth(), Account)
    expect(screen.getByText(storyUser.name)).toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()
  })

  it('should apply updateUser and logout without network calls', async () => {
    decorate(withAuth({ ...storyUser, name: 'Ada' }), Account)
    expect(screen.getByText('Ada')).toBeInTheDocument()
    act(() => screen.getByRole('button', { name: 'rename' }).click())
    expect(screen.getByText('Renamed')).toBeInTheDocument()
    await act(async () => screen.getByRole('button', { name: 'sign out' }).click())
    expect(screen.getByText('signed out')).toBeInTheDocument()
  })

  it('should render signed out when given null', () => {
    decorate(withAuth(null), Account)
    expect(screen.getByText('signed out')).toBeInTheDocument()
  })
})
