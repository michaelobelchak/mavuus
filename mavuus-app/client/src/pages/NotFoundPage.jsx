import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Compass } from 'lucide-react'
import Button from '../components/ui/Button'
import GradientText from '../components/ui/GradientText'

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-bg-light flex items-center justify-center px-4 overflow-hidden">
      {/* Decorative mesh gradient */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-brand-pink/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-1/4 w-[500px] h-[500px] bg-brand-blue/15 rounded-full blur-[120px]" />
      </div>

      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-pink/15 to-brand-blue/15 border border-brand-pink/10 mb-6">
          <Compass size={36} className="text-brand-pink" strokeWidth={1.5} />
        </div>

        <p className="text-7xl md:text-[96px] font-bold leading-none mb-4">
          <GradientText>404</GradientText>
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue mb-3">
          We can&rsquo;t find that page
        </h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          The page you&rsquo;re looking for doesn&rsquo;t exist, was moved, or the link is broken. Let&rsquo;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/home">
            <Button variant="outline">
              <ArrowLeft size={16} /> Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button>
              <Home size={16} /> Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
