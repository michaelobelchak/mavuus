import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle size={48} className="text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-dark-blue mb-2">Something went wrong</h2>
          <p className="text-neutral-500 mb-6 max-w-md">
            An unexpected error occurred. Please try again or go back.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-brand-pink text-white rounded-xl text-sm font-medium hover:bg-brand-pink/90 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-white text-neutral-600 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
