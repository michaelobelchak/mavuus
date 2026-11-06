import { isValidElement } from 'react'
import { Menu } from '@base-ui/react/menu'
import { cn } from '../../lib/cn'
import { ExternalHint } from '../../lib/ExternalHint'
import { linkProps } from '../../lib/linkProps'
import { resolveOption } from '../../lib/resolveOption'
import { Icon } from '../../primitives'
import { floatingPopupClass, MENU_ALIGNS, MENU_SIDES, menuItemVariants } from './dropdownMenuVariants'

const TONES = ['default', 'danger']

// Splits the flat items list into groups: a `label` entry starts a named group, a `separator`
// entry ends the current group and draws a line.
function toGroups(items) {
  const groups = []
  let current = { label: undefined, items: [] }
  const close = () => {
    if (current.label || current.items.length) groups.push(current)
  }
  items.forEach((item, index) => {
    if (item.type === 'separator') {
      close()
      groups.push({ separator: true, key: `separator-${index}` })
      current = { label: undefined, items: [] }
    } else if (item.type === 'label') {
      close()
      current = { label: item.label, items: [] }
    } else {
      current.items.push({ ...item, key: item.key ?? `${item.label}-${index}` })
    }
  })
  close()
  return groups
}

function ItemContent({ item, opensNewTab }) {
  return (
    <>
      {item.icon && <Icon icon={item.icon} size="sm" />}
      <span className="min-w-0 grow truncate">
        {item.label}
        {opensNewTab && <ExternalHint />}
      </span>
      {item.shortcut && <kbd className="ml-auto font-sans text-caption text-text-muted">{item.shortcut}</kbd>}
    </>
  )
}

function MenuEntry({ item }) {
  const tone = resolveOption(item.tone, TONES, 'default', 'DropdownMenu', 'tone')
  const className = menuItemVariants({ tone })

  if (item.to !== undefined || item.href !== undefined) {
    const link = linkProps({ to: item.to, href: item.href, target: item.target, rel: item.rel, inactive: item.disabled })
    const { Component } = link
    return (
      <Menu.LinkItem
        closeOnClick
        label={item.label}
        data-disabled={item.disabled ? '' : undefined}
        render={<Component {...link.props} />}
        className={className}
        onClick={item.disabled ? undefined : item.onSelect}
      >
        <ItemContent item={item} opensNewTab={link.opensNewTab} />
      </Menu.LinkItem>
    )
  }

  return (
    <Menu.Item label={item.label} disabled={item.disabled} className={className} onClick={item.onSelect}>
      <ItemContent item={item} />
    </Menu.Item>
  )
}

/**
 * Menu of actions on Base UI Menu. Arrow keys move, Enter or a click selects, Escape closes and
 * returns focus to the trigger.
 * - `trigger`: the element that opens it (a Button or IconButton with a name).
 * - `items`: [{ label, icon, onSelect(event), to | href, disabled, tone: 'danger', shortcut }].
 *   `to` and `href` render link items through lib/linkProps. `{ type: 'label', label }` starts a
 *   named group; `{ type: 'separator' }` draws a line. `shortcut` is display text only.
 * - `side` (bottom by default) and `align` (start by default) place the popup.
 * - `open` / `defaultOpen` / `onOpenChange`.
 * `ref` and other props go to the trigger; `popupClassName` styles the popup.
 */
export function DropdownMenu({
  trigger,
  items = [],
  side,
  align,
  open,
  defaultOpen,
  onOpenChange,
  popupClassName,
  ref,
  ...props
}) {
  const resolvedSide = resolveOption(side, MENU_SIDES, 'bottom', 'DropdownMenu', 'side')
  const resolvedAlign = resolveOption(align, MENU_ALIGNS, 'start', 'DropdownMenu', 'align')

  return (
    <Menu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Menu.Trigger ref={ref} render={isValidElement(trigger) ? trigger : undefined} {...props}>
        {isValidElement(trigger) ? undefined : trigger}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side={resolvedSide} align={resolvedAlign} sideOffset={4} className="z-(--ds-z-dropdown)">
          <Menu.Popup
            className={cn(
              'flex max-h-(--available-height) min-w-48 flex-col overflow-y-auto p-ds-xxs',
              floatingPopupClass,
              popupClassName,
            )}
          >
            {toGroups(items).map((group, index) => {
              if (group.separator) {
                return <Menu.Separator key={group.key} className="mx-ds-xs my-ds-xxs h-px bg-border-default" />
              }
              const entries = group.items.map((item) => <MenuEntry key={item.key} item={item} />)
              if (!group.label) return entries
              return (
                <Menu.Group key={`group-${index}`} className="flex flex-col">
                  <Menu.GroupLabel className="px-ds-sm py-ds-xxs text-caption font-semibold text-text-muted">
                    {group.label}
                  </Menu.GroupLabel>
                  {entries}
                </Menu.Group>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
