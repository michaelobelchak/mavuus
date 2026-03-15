import Avatar from '../ui/Avatar'
import { marketingLeaders } from '../../data/mockData'

export default function LeadersGrid() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-dark-blue mb-4">
          Learn From The Best
        </h2>
        <p className="text-center text-neutral-500 mb-12 max-w-xl mx-auto">
          Our community features marketing leaders from the world&apos;s most innovative companies.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {marketingLeaders.map(leader => (
            <div key={leader.id} className="text-center group">
              <Avatar
                name={leader.name}
                size="xl"
                className="mx-auto group-hover:ring-4 group-hover:ring-brand-pink/20 transition-all"
              />
              <p className="mt-3 text-sm font-semibold text-dark-blue">{leader.name}</p>
              <p className="text-xs text-neutral-500">{leader.title}</p>
              <p className="text-xs text-brand-pink font-medium">{leader.company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
