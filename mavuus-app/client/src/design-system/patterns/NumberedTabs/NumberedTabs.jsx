import { useEffect, useState } from 'react'
import { Progress } from '@base-ui/react/progress'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { Pause, Play } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/cn'
import { Eyebrow, IconButton } from '../../primitives'

const INTERVAL_MS = 6000

const tabClass = [
  'group -ml-0.5 flex cursor-pointer items-start gap-ds-md border-l-2 border-transparent py-ds-md pr-ds-md pl-ds-lg text-left',
  'transition-colors duration-300 ease-enter motion-reduce:transition-none',
  'hover:bg-surface-hover data-[active]:border-border-brand data-[active]:bg-surface-selected',
].join(' ')

/**
 * Numbered vertical tabs with a progress scale, built on Base UI Tabs.
 * - `label`: names the tab list. `items`: [{ num, title, tag?, ... }]. `renderPanel(item)` renders the
 *   panel body (or the item's `content` is used). `scaleStart` / `scaleEnd`: text at the ends of the scale.
 * - `initial`: index of the first active tab (default 0).
 * Autoplay advances every 6s while the page is visible. It pauses on hover and keyboard focus, has a
 * visible pause control, stops for good once someone picks a tab, and never runs under reduced motion.
 * Arrow Up/Down, Home and End move between tabs and activate them.
 */
export function NumberedTabs({ label, items = [], scaleStart, scaleEnd, initial = 0, renderPanel, className, ref, ...props }) {
  const [active, setActive] = useState(initial)
  const [stopped, setStopped] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduced = useReducedMotion()
  const count = items.length

  const running = !stopped && !userPaused && !hovered && !focused && !reduced && count > 1

  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') setActive((index) => (index + 1) % count)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [running, count])

  const choose = (value) => {
    setStopped(true)
    setActive(value)
  }

  const showPause = !stopped && !reduced && count > 1
  const current = items[active]

  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-ds-xl', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-ds-md gap-y-ds-sm sm:flex-nowrap">
        <Eyebrow as="span" tone="muted" className="shrink-0">
          {scaleStart}
        </Eyebrow>
        <div aria-hidden="true" className="order-3 min-w-full grow sm:order-none sm:min-w-0">
          <Progress.Root value={count ? ((active + 1) / count) * 100 : 0}>
            <Progress.Track className="relative h-1.5 w-full overflow-hidden rounded-chip bg-border-default">
              <Progress.Indicator className="block h-full rounded-chip bg-surface-brand transition-[width] duration-500 ease-enter motion-reduce:transition-none" />
            </Progress.Track>
          </Progress.Root>
        </div>
        <Eyebrow as="span" tone="muted" className="shrink-0">
          {scaleEnd}
        </Eyebrow>
        {showPause && (
          <IconButton
            icon={userPaused ? Play : Pause}
            variant="ghost"
            className="order-2 shrink-0 rounded-chip sm:order-none"
            aria-label={userPaused ? 'Resume automatic tab rotation' : 'Pause automatic tab rotation'}
            onClick={() => setUserPaused((paused) => !paused)}
          />
        )}
      </div>

      <TabsPrimitive.Root
        value={active}
        onValueChange={choose}
        orientation="vertical"
        className="grid grid-cols-1 items-start gap-x-ds-xxl gap-y-ds-xl lg:grid-cols-9"
      >
        <TabsPrimitive.List
          activateOnFocus
          aria-label={label}
          className="flex flex-col border-l-2 border-border-default lg:col-span-4"
        >
          {items.map((item, index) => (
            <TabsPrimitive.Tab key={item.num ?? index} value={index} className={tabClass}>
              <span className="text-h4 font-semibold text-text-faint tabular-nums group-data-[active]:text-text-brand-strong">
                {item.num}
              </span>
              <span className="flex flex-col gap-ds-xxs">
                <span className="text-h4 font-medium text-text-muted group-hover:text-text-primary group-data-[active]:text-text-primary">
                  {item.title}
                </span>
                {item.tag && (
                  <span className="text-body-sm text-text-faint group-data-[active]:text-text-brand-strong">{item.tag}</span>
                )}
              </span>
            </TabsPrimitive.Tab>
          ))}
        </TabsPrimitive.List>

        {items.map((item, index) => (
          <TabsPrimitive.Panel key={item.num ?? index} value={index} className="rounded-card lg:col-span-5">
            {index === active && current && (
              <div key={active} className="ds-animate-fade-in flex flex-col gap-ds-md pt-ds-xs">
                <div
                  data-numbered-tabs-number=""
                  aria-hidden="true"
                  className="text-outline-brand text-display font-semibold tracking-tight"
                >
                  {item.num}
                </div>
                {renderPanel ? renderPanel(item) : item.content}
              </div>
            )}
          </TabsPrimitive.Panel>
        ))}
      </TabsPrimitive.Root>
    </div>
  )
}
