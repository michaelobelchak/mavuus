import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { ArrowRight } from 'lucide-react'

export default function CTABanner({
  title = 'Ready to Level Up Your Marketing?',
  subtitle = 'Join Mavuus today and connect with marketing leaders who are shaping the future.',
  buttonText = 'Join Mavuus Now',
  buttonLink = '/register',
}) {
  return (
    <section className="bg-brand-pink py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/80 mb-8 text-lg">{subtitle}</p>
        <Link to={buttonLink}>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-brand-pink border-white hover:bg-white/90 hover:text-brand-pink"
          >
            {buttonText} <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </section>
  )
}
