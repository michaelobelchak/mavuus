import { Component } from 'react'

const wrapperStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: '#F5F8FE',
  fontFamily: 'Manrope, system-ui, sans-serif',
}

/**
 * Root-level React error boundary.
 * Catches render/lifecycle errors in descendants and shows a friendly
 * fallback with retry + reload actions. No external deps so it cannot
 * itself crash the app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surfacing so the user can find the stack in DevTools
    console.error('[ErrorBoundary]', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div style={wrapperStyle}>
        <div
          style={{
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            background: 'white',
            borderRadius: 24,
            padding: '40px 32px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.10)',
            border: '1px solid rgba(242, 109, 146, 0.12)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(242,109,146,0.12), rgba(31,100,141,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1C2232',
              margin: '0 0 12px',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#595F6C', margin: '0 0 24px', lineHeight: 1.6 }}>
            An unexpected error occurred while rendering this page. Try again, or reload the
            application if the problem persists.
          </p>
          {error?.message && (
            <pre
              style={{
                textAlign: 'left',
                fontSize: 12,
                color: '#D94D75',
                background: '#FEF2F4',
                padding: 12,
                borderRadius: 12,
                marginBottom: 24,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 120,
                overflow: 'auto',
              }}
            >
              {error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                border: '1px solid #D1D5DB',
                borderRadius: 16,
                background: 'white',
                color: '#353B45',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: 16,
                background: '#F26D92',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(242,109,146,0.25)',
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    )
  }
}
