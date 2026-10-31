import { useEffect, useRef } from 'react'
import { LEADERS } from '../../../data/live/home'

function LeaderCard({ leader, hidden }) {
  return (
    <div className="flex w-[300px] flex-none items-start" aria-hidden={hidden || undefined}>
      <div className="flex flex-1 items-center justify-around pr-8">
        <div className="flex flex-col items-start justify-center gap-4 max-[991px]:text-center">
          <img src={leader.image} alt={hidden ? '' : leader.name} className="max-w-full" />
          <div>
            <div className="text-xl font-bold leading-[1.5] text-dark-blue max-[767px]:text-lg">{leader.name}</div>
            <div className="text-base leading-6 text-live-grey">{leader.position}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LeadersMarquee() {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const animation = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(50%)' }], {
      duration: 60000,
      iterations: Infinity,
    })
    return () => animation.cancel()
  }, [])

  return (
    <section className="pt-8">
      <div className="mt-4 max-[991px]:mt-8">
        <div className="flex max-w-full justify-end overflow-hidden">
          <div ref={trackRef} className="flex justify-end">
            {[false, true].map((hidden) => (
              <div key={String(hidden)} className="flex">
                {LEADERS.map((leader) => (
                  <LeaderCard key={leader.name} leader={leader} hidden={hidden} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
