import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Pause, Play } from 'lucide-react'
import { Label } from './Typography'

const INTERVAL_MS = 6000
const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getReduced = () => window.matchMedia(REDUCED).matches

/**
 * Numbered vertical tabs with a progress scale (home "Strategy to Leadership", services "Ways to Work Together").
 * Auto-advances, but pauses on hover and keyboard focus, has a visible pause control, stops for good once
 * someone picks a tab, and never runs under reduced motion. Arrow keys, Home and End move between tabs.
 */
export default function NumberedTabs({ label, items, scaleStart, scaleEnd, initial = 0, renderPanel }) {
  const [active, setActive] = useState(initial)
  const [stopped, setStopped] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => true)
  const tabRefs = useRef([])
  const id = useId()

  const running = !stopped && !userPaused && !hovered && !focused && !reduced

  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setActive((i) => (i + 1) % items.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [running, items.length])

  const choose = (i, focus = false) => {
    setStopped(true)
    setActive(i)
    if (focus) tabRefs.current[i]?.focus()
  }

  const onKeyDown = (e) => {
    const last = items.length - 1
    const next = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: last }[e.key]
    if (next === undefined) return
    e.preventDefault()
    choose(next > last ? 0 : next < 0 ? last : next, true)
  }

  const current = items[active]
  const showPause = !stopped && !reduced

  return (
    <div
      className="flex flex-col gap-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}
    >
      <div className="flex items-center gap-x-4 max-[479px]:flex-wrap max-[479px]:gap-y-3">
        <Label className="shrink-0">{scaleStart}</Label>
        <div className="relative h-1.5 grow overflow-hidden rounded-full bg-live-track max-[479px]:order-3 max-[479px]:min-w-full" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--color-live-sky),var(--color-brand-pink))] transition-[width] duration-500 ease-[var(--ease-live)]"
            style={{ width: `${((active + 1) / items.length) * 100}%` }}
          />
        </div>
        <Label className="shrink-0">{scaleEnd}</Label>
        {showPause && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? 'Resume automatic tab rotation' : 'Pause automatic tab rotation'}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-live-muted transition-colors hover:bg-live-blue-light hover:text-dark-blue max-[479px]:order-2"
          >
            {userPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1.25fr] items-start gap-x-16 gap-y-8 max-[991px]:grid-cols-1">
        <div className="flex flex-col border-l-2 border-live-track" role="tablist" aria-label={label} aria-orientation="vertical" onKeyDown={onKeyDown}>
          {items.map((item, i) => {
            const isActive = i === active
            return (
              <button
                key={item.num}
                ref={(el) => { tabRefs.current[i] = el }}
                id={`${id}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => choose(i)}
                className={`group -ml-0.5 flex cursor-pointer items-start gap-x-5 border-l-2 py-5 pr-4 pl-6 text-left transition-colors duration-300 ${
                  isActive ? 'border-brand-pink bg-[linear-gradient(90deg,rgba(242,109,146,0.08),transparent)]' : 'border-transparent hover:bg-black/[0.02]'
                }`}
              >
                <span className={`text-lg leading-[1.4] font-semibold tabular-nums transition-colors duration-300 ${isActive ? 'text-brand-pink' : 'text-live-faint'}`}>
                  {item.num}
                </span>
                <span className="flex flex-col gap-y-1">
                  <span className={`text-xl leading-[1.3] font-medium transition-colors duration-300 group-hover:text-dark-blue ${isActive ? 'text-dark-blue' : 'text-live-muted'}`}>
                    {item.title}
                  </span>
                  {item.tag && (
                    <span className={`text-[15px] leading-6 ${isActive ? 'text-brand-pink' : 'text-live-faint'}`}>{item.tag}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="rounded-2xl">
          <div key={current.num} className="flex animate-[fadeIn_0.45s_var(--ease-live)] flex-col gap-y-4 pt-2 motion-reduce:animate-none">
            <div
              aria-hidden="true"
              className="text-[96px] leading-none font-semibold tracking-[-2px] text-transparent [-webkit-text-stroke:2px_var(--color-live-pink-200)] max-[991px]:text-[64px]"
            >
              {current.num}
            </div>
            {renderPanel(current)}
          </div>
        </div>
      </div>
    </div>
  )
}
