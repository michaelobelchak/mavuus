import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check, Minus } from 'lucide-react'
import { choiceHitArea, choiceLabelClass } from '../../lib/choice'
import { cn } from '../../lib/cn'

const boxClass = [
  'inline-flex size-5 shrink-0 items-center justify-center rounded-tag border border-border-strong bg-surface-raised',
  'text-text-on-brand transition-[background-color,border-color] duration-150 ease-enter motion-reduce:transition-none',
  'data-[checked]:border-surface-brand-strong data-[checked]:bg-surface-brand-strong',
  'data-[indeterminate]:border-surface-brand-strong data-[indeterminate]:bg-surface-brand-strong',
  'data-[disabled]:cursor-not-allowed data-[disabled]:border-border-default data-[disabled]:bg-surface-sunken',
  'data-[disabled]:data-[checked]:text-text-disabled',
].join(' ')

/**
 * Checkbox built on Base UI Checkbox.
 * - `label`: visible text. The checkbox and text are wrapped in a <label>, so clicking the text toggles it.
 *   Without `label`, pass `aria-label`.
 * - `checked` / `defaultChecked` / `onCheckedChange(checked, details)`, `indeterminate`, `disabled`.
 * `ref` and other props go to the checkbox; `className` goes to the outer element.
 */
export function Checkbox({ label, indeterminate = false, className, ref, ...props }) {
  const box = (
    <CheckboxPrimitive.Root
      ref={ref}
      indeterminate={indeterminate}
      className={cn(boxClass, !label && choiceHitArea, !label && className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex">
        {indeterminate ? (
          <Minus aria-hidden="true" className="size-4" strokeWidth={3} />
        ) : (
          <Check aria-hidden="true" className="size-4" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label) return box

  return (
    <label className={cn(choiceLabelClass, className)}>
      {box}
      {label}
    </label>
  )
}
