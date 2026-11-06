import { createContext, use, useId } from 'react'
import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { choiceHitArea, choiceInvalidClass, choiceLabelClass } from '../../lib/choice'
import { cn } from '../../lib/cn'
import { isInvalid } from '../../lib/field'

// RadioGroup shares its invalid state with every Radio inside it, options or children.
const RadioGroupInvalidContext = createContext(false)

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
  const groupInvalid = use(RadioGroupInvalidContext)
  const radio = (
    <RadioPrimitive.Root
      ref={ref}
      className={cn(circleClass, groupInvalid && choiceInvalidClass, !label && choiceHitArea, !label && className)}
      {...props}
    >
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
 * - `invalid` (or a truthy aria-invalid): aria-invalid on the group and the error border on every radio.
 * - `required`: aria-required on the group, and the Label-style asterisk and sr-only "(required)" on `label`.
 * - `label`: visible group label above the radios, wired with aria-labelledby. Or pass `aria-label`.
 * `className` goes to the outer element (the wrapper when `label` is given), other props to the group.
 */
export function RadioGroup({
  label,
  options,
  orientation = 'vertical',
  invalid = false,
  required = false,
  className,
  children,
  ref,
  ...props
}) {
  const labelId = useId()
  const ariaInvalid = props['aria-invalid']
  const invalidState = isInvalid(invalid, ariaInvalid)
  const group = (
    <RadioGroupInvalidContext value={invalidState}>
      <RadioGroupPrimitive
        ref={ref}
        required={required}
        aria-labelledby={label ? labelId : undefined}
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row flex-wrap gap-ds-lg' : 'flex-col gap-ds-xxs',
          !label && className,
        )}
        {...props}
        aria-invalid={invalidState ? true : ariaInvalid}
      >
        {options
          ? options.map((option) => (
              <Radio key={String(option.value)} value={option.value} label={option.label} disabled={option.disabled} />
            ))
          : children}
      </RadioGroupPrimitive>
    </RadioGroupInvalidContext>
  )

  if (!label) return group

  return (
    <div className={cn('flex flex-col gap-ds-xs', className)}>
      <span id={labelId} className="text-body-sm font-semibold text-text-primary">
        {label}
        {required && (
          <>
            {' '}
            <span aria-hidden="true" className="text-status-error">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </span>
      {group}
    </div>
  )
}
