import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-brand-pink mb-4">404</p>
        <h1 className="text-2xl font-bold text-dark-blue mb-2">Page not found</h1>
        <p className="text-neutral-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="outline"><ArrowLeft size={16} /> Go Home</Button>
          </Link>
          <Link to="/dashboard">
            <Button><Home size={16} /> Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
