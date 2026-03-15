import { stats } from '../../data/mockData'

export default function StatsSection({ variant = 'light' }) {
  const isLight = variant === 'light'

  return (
    <section className={`py-20 px-6 ${isLight ? 'bg-white' : 'bg-brand-pink'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className={`text-4xl font-bold ${isLight ? 'text-brand-pink' : 'text-white'}`}>
                {stat.value}
              </p>
              <p className={`mt-2 text-sm ${isLight ? 'text-neutral-500' : 'text-white/80'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
