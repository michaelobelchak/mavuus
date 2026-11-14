import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '../src/design-system/patterns/Toast'
import { MockAuthProvider } from './MockAuthProvider'
import { storyUser } from './storyUser'

export { storyUser }

export const THEMES = { light: 'Light', dark: 'Dark (placeholder)' }

/**
 * Global: wraps the story in a MemoryRouter. A story can set `parameters.router`
 * ({ initialEntries, path }) to start at a URL and render under a route, so useParams works.
 */
export function withRouter(Story, context) {
  const { initialEntries = ['/'], path } = context.parameters?.router ?? {}
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {path ? (
        <Routes>
          <Route path={path} element={<Story />} />
        </Routes>
      ) : (
        <Story />
      )}
    </MemoryRouter>
  )
}

/**
 * Global: sets `data-theme` from the theme toolbar on the document element. Dark has no role
 * tokens yet, so it falls back to the light values.
 */
export function withTheme(Story, context) {
  const theme = context.globals?.theme in THEMES ? context.globals.theme : 'light'
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme
  return <Story />
}

/**
 * Global: pads the story with the design-system spacing, except for `layout: 'fullscreen'`.
 * The background comes from the backgrounds toolbar, so this wrapper paints none.
 */
export function withLayout(Story, context) {
  if (context.parameters?.layout === 'fullscreen') return <Story />
  return (
    <div className="p-ds-lg font-sans text-text-primary">
      <Story />
    </div>
  )
}

/** Opt-in: mounts the design-system Toaster next to the story (for stories that call toast). */
export function withToaster(Story) {
  return (
    <>
      <Story />
      <Toaster />
    </>
  )
}

/**
 * Opt-in: provides the app's AuthContext with a mock value (same shape as AuthProvider, no
 * network calls). `withAuth()` signs in `storyUser`, `withAuth(null)` renders signed out.
 */
export function withAuth(user = storyUser) {
  return function AuthDecorator(Story) {
    return (
      <MockAuthProvider initialUser={user}>
        <Story />
      </MockAuthProvider>
    )
  }
}
