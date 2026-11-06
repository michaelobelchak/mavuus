import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { choiceHitArea, choiceLabelClass } from '../../lib/choice'
import { cn } from '../../lib/cn'

const circleClass = [
  'inline-flex size-5 shrink-0 items-center justify-center rounded-chip border border-border-strong bg-surface-raised',
  'transition-[border-color] duration-150 ease-enter motion-reduce:transition-none',
  'data-[checked]:border-surface-brand-strong',
  'data-[disabled]:cursor-not-allowed data-[disabled]:border-border-default data-[disabled]:bg-surface-sunken',
].join(' ')

/**
 * One radio, for use inside RadioGroup.
 * - `label`: visible text, wrapped in a <label> with the radio. Without it, pass `aria-label`.
 * `ref` and other props go to the radio; `className` goes to the outer element.
 */
export function Radio({ label, className, ref, ...props }) {
  const radio = (
    <RadioPrimitive.Root ref={ref} className={cn(circleClass, !label && choiceHitArea, !label && className)} {...props}>
      <RadioPrimitive.Indicator className="size-2.5 rounded-chip bg-surface-brand-strong data-[disabled]:bg-text-disabled" />
    </RadioPrimitive.Root>
  )

  if (!label) return radio

  return (
    <label className={cn(choiceLabelClass, className)}>
      {radio}
      {label}
    </label>
  )
}

/**
 * Radio group built on Base UI RadioGroup. Arrow keys move the selection within the group.
 * - `options`: [{ value, label, disabled }], or pass <Radio> children instead.
 * - `value` / `defaultValue` / `onValueChange(value, details)`.
 * - `orientation`: vertical (default) or horizontal. Sets the layout and aria-orientation.
 * Name the group with `aria-label` or `aria-labelledby`.
 */
export function RadioGroup({ options, orientation = 'vertical', className, children, ref, ...props }) {
  return (
    <RadioGroupPrimitive
      ref={ref}
      aria-orientation={orientation}
      className={cn('flex', orientation === 'horizontal' ? 'flex-row flex-wrap gap-ds-lg' : 'flex-col gap-ds-xxs', className)}
      {...props}
    >
      {options
        ? options.map((option) => (
            <Radio key={String(option.value)} value={option.value} label={option.label} disabled={option.disabled} />
          ))
        : children}
    </RadioGroupPrimitive>
  )
}
