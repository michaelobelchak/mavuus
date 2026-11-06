import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { controlIconSizes, DEFAULT_CONTROL_SIZE, resolveControlSize } from '../../lib/controlSizes'
import { fieldVariants, isInvalid } from '../../lib/field'
import { SELECT_SIZES, selectItemClass, selectTriggerVariants } from './selectVariants'

/**
 * Single-value select built on Base UI Select, on the control height scale (sm 40, md 48, lg 56).
 * - `items`: [{ value, label, disabled }]. The trigger shows the selected item's label.
 * - `value` / `defaultValue` / `onValueChange(value, details)`.
 * - Name it with `aria-label`, or give it an `id` and point a <Label htmlFor> at it.
 * `ref`, `className` and other props go to the trigger button; `popupClassName` styles the list.
 */
export function Select({
  items = [],
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  name,
  required,
  disabled,
  readOnly,
  placeholder,
  size,
  invalid = false,
  leadingIcon: LeadingIcon,
  className,
  popupClassName,
  ref,
  ...props
}) {
  const resolvedSize = resolveControlSize(size, SELECT_SIZES, DEFAULT_CONTROL_SIZE, 'Select')
  const ariaInvalid = props['aria-invalid']
  const invalidState = isInvalid(invalid, ariaInvalid)
  const iconClass = cn('shrink-0 text-text-muted', controlIconSizes[resolvedSize])

  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      name={name}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          fieldVariants({ invalid: invalidState, size: resolvedSize }),
          selectTriggerVariants({ invalid: invalidState, size: resolvedSize }),
          className,
        )}
        {...props}
        aria-invalid={invalidState ? true : ariaInvalid}
      >
        {LeadingIcon && <LeadingIcon aria-hidden="true" className={iconClass} />}
        <SelectPrimitive.Value
          placeholder={placeholder}
          className="min-w-0 flex-1 truncate data-[placeholder]:text-text-muted"
        />
        <SelectPrimitive.Icon
          className={cn(
            'flex text-text-muted transition-transform duration-150 ease-move motion-reduce:transition-none',
            'in-data-[popup-open]:rotate-180',
          )}
        >
          <ChevronDown aria-hidden="true" className={controlIconSizes[resolvedSize]} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={4}
          alignItemWithTrigger={false}
          data-select-positioner=""
          className="z-(--ds-z-dropdown)"
        >
          <SelectPrimitive.Popup
            className={cn(
              'max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-control border border-border-default',
              'bg-surface-overlay p-ds-xxs text-text-primary shadow-overlay',
              'origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-enter',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:ease-exit',
              'motion-reduce:transition-none',
              popupClassName,
            )}
          >
            <SelectPrimitive.List>
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={String(item.value)}
                  value={item.value}
                  disabled={item.disabled}
                  className={selectItemClass}
                >
                  <SelectPrimitive.ItemText className="flex-1">{item.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="flex text-text-brand-strong">
                    <Check aria-hidden="true" className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
