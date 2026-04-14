import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import { testimonials as fallbackTestimonials } from '../../data/mockData'
import { Star } from 'lucide-react'

export default function TestimonialsSection({ title = 'What Our Members Say', bg = 'bg-bg-light' }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setItems(data.filter(t => t.is_featured).map(t => ({ id: t.id, name: t.name, title: t.title, company: t.company, quote: t.quote, avatar_url: t.avatar_url }))))
      .catch(() => setItems(fallbackTestimonials))
  }, [])

  const displayItems = items || fallbackTestimonials

  return (
    <section className={`py-20 px-6 ${bg}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-dark-blue mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayItems.map(t => (
            <Card key={t.id} className="flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-neutral-600 leading-relaxed flex-1 text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-100">
                <Avatar src={t.avatar_url} name={t.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-dark-blue">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.title}, {t.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
