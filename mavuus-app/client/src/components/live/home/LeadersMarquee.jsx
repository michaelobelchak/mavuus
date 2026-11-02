import { useEffect, useRef } from 'react'
import LiveContainer from '../LiveContainer'
import Reveal from '../ui/Reveal'
import { Label } from '../ui/Typography'
import { LEADERS } from '../../../data/live/home'

// Leader photos come in two frame heights on the CDN (592x658 and 592x714).
const photoHeight = (src) => (src.includes('Frame%203310') ? 714 : 658)

function LeaderCard({ leader, decorative }) {
  return (
    <li className="flex w-[300px] flex-none flex-col items-start gap-4 pr-8">
      <img src={leader.image} alt={decorative ? '' : leader.name} width="592" height={photoHeight(leader.image)} loading="lazy" decoding="async" className="h-auto w-full rounded-2xl" />
      <div>
        <p className="m-0 text-xl leading-[1.5] font-bold text-dark-blue max-[767px]:text-lg">{leader.name}</p>
        <p className="m-0 text-base leading-6 text-live-grey">{leader.position}</p>
      </div>
    </li>
  )
}

export default function LeadersMarquee() {
  const trackRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const animation = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(50%)' }], {
      duration: 60000,
      iterations: Infinity,
    })
    animationRef.current = animation
    return () => animation.cancel()
  }, [])

  const pause = () => animationRef.current?.pause()
  const play = () => animationRef.current?.play()

  return (
    <section aria-labelledby="leaders-heading">
      <LiveContainer>
        <Reveal>
          <Label as="h2" id="leaders-heading" className="m-0 block text-center">
            Marketing leaders in the Mavuus community
          </Label>
        </Reveal>
      </LiveContainer>
      <div
        className="mt-10 flex max-w-full justify-end overflow-hidden max-[767px]:mt-8"
        onMouseEnter={pause}
        onMouseLeave={play}
        onFocus={pause}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) play()
        }}
      >
        <div ref={trackRef} className="flex justify-end">
          <ul className="m-0 flex list-none p-0">
            {LEADERS.map((leader) => (
              <LeaderCard key={leader.name} leader={leader} />
            ))}
          </ul>
          <ul className="m-0 flex list-none p-0" aria-hidden="true" inert>
            {LEADERS.map((leader) => (
              <LeaderCard key={leader.name} leader={leader} decorative />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
