import { createContext, use } from 'react'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cn } from '../../lib/cn'
import { resolveControlSize } from '../../lib/controlSizes'
import { resolveOption } from '../../lib/resolveOption'
import { Icon } from '../../primitives'
import {
  DEFAULT_TABS_SIZE,
  DEFAULT_TABS_VARIANT,
  TABS_SIZES,
  TABS_VARIANTS,
  tabListVariants,
  tabVariants,
} from './tabsVariants'

const TabsStyleContext = createContext({ variant: DEFAULT_TABS_VARIANT, size: DEFAULT_TABS_SIZE })

/**
 * Tabs built on Base UI Tabs. Arrow keys move focus between tabs, Home and End jump to the ends,
 * disabled tabs stay focusable (so they can be discovered) but never activate. Activation is manual (Enter or Space) like Base UI's default;
 * pass `activateOnFocus` to activate on arrow focus.
 * - `items`: [{ value, label, content, disabled, icon }]. Or pass TabList, Tab and TabPanel children.
 * - `variant`: underline (default) or pill (segmented). `size`: sm or md (default).
 * - `value` / `defaultValue` / `onValueChange(value, details)`.
 * - With `items`, `aria-label` / `aria-labelledby` name the tab list; `listClassName` and
 *   `panelClassName` style the list and panels. `className` goes to the root.
 */
export function Tabs({
  items,
  variant,
  size,
  value,
  defaultValue,
  onValueChange,
  activateOnFocus = false,
  orientation,
  listClassName,
  panelClassName,
  className,
  children,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}) {
  const resolvedVariant = resolveOption(variant, TABS_VARIANTS, DEFAULT_TABS_VARIANT, 'Tabs', 'variant')
  const resolvedSize = resolveControlSize(size, TABS_SIZES, DEFAULT_TABS_SIZE, 'Tabs')

  return (
    <TabsStyleContext value={{ variant: resolvedVariant, size: resolvedSize }}>
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue ?? (value === undefined ? items?.find((item) => !item.disabled)?.value : undefined)}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cn('flex flex-col gap-ds-md', className)}
        {...props}
        {...(items ? {} : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy })}
      >
        {items ? (
          <>
            <TabList
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              activateOnFocus={activateOnFocus}
              className={listClassName}
            >
              {items.map((item) => (
                <Tab key={String(item.value)} value={item.value} disabled={item.disabled} icon={item.icon}>
                  {item.label}
                </Tab>
              ))}
            </TabList>
            {items.map((item) => (
              <TabPanel key={String(item.value)} value={item.value} className={panelClassName}>
                {item.content}
              </TabPanel>
            ))}
          </>
        ) : (
          children
        )}
      </TabsPrimitive.Root>
    </TabsStyleContext>
  )
}

/** The row of tabs. Name it with `aria-label` or `aria-labelledby`. */
export function TabList({ activateOnFocus = false, className, ref, ...props }) {
  const { variant } = use(TabsStyleContext)
  return (
    <TabsPrimitive.List
      ref={ref}
      activateOnFocus={activateOnFocus}
      className={cn(tabListVariants({ variant }), className)}
      {...props}
    />
  )
}

/** One tab. `value` links it to the TabPanel with the same value. `icon` takes a lucide component. */
export function Tab({ icon: IconComponent, className, children, ref, ...props }) {
  const { variant, size } = use(TabsStyleContext)
  return (
    <TabsPrimitive.Tab ref={ref} className={cn(tabVariants({ variant, size }), className)} {...props}>
      <Icon icon={IconComponent} size={size === 'sm' ? 'sm' : 'md'} />
      {children}
    </TabsPrimitive.Tab>
  )
}

/** The content for the tab with the same `value`. Hidden panels are unmounted unless `keepMounted`. */
export function TabPanel({ className, ref, ...props }) {
  return <TabsPrimitive.Panel ref={ref} className={cn('text-body text-text-primary', className)} {...props} />
}
