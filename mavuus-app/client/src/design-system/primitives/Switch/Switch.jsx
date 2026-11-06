import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { choiceLabelClass } from '../../lib/choice'
import { cn } from '../../lib/cn'
import { isInvalid } from '../../lib/field'

// 44 by 24 track; the after: element stretches the hit area to 44px tall.
// The off track uses surface-control-off so it keeps 3:1 contrast against white.
const trackClass = [
  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-chip bg-surface-control-off p-0.5',
  'after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[""]',
  'transition-[background-color] duration-150 ease-enter motion-reduce:transition-none',
  'data-[checked]:bg-surface-brand-strong',
  'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-sunken',
].join(' ')

const thumbClass = [
  'size-5 rounded-chip bg-surface-raised shadow-card',
  'transition-transform duration-150 ease-move motion-reduce:transition-none',
  'data-[checked]:translate-x-5',
].join(' ')

/**
 * On/off switch built on Base UI Switch. Use for settings that apply right away.
 * - `label`: visible text, wrapped in a <label> with the switch. Without it, pass `aria-label`.
 * - `checked` / `defaultChecked` / `onCheckedChange(checked, details)`, `disabled`.
 * - `invalid` (or a truthy aria-invalid): sets aria-invalid and an error ring around the track.
 * `ref` and other props go to the switch; `className` goes to the outer element.
 */
export function Switch({ label, invalid = false, className, ref, ...props }) {
  const ariaInvalid = props['aria-invalid']
  const invalidState = isInvalid(invalid, ariaInvalid)
  const toggle = (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(trackClass, invalidState && 'ring-2 ring-status-error ring-offset-2', !label && className)}
      {...props}
      aria-invalid={invalidState ? true : ariaInvalid}
    >
      <SwitchPrimitive.Thumb className={thumbClass} />
    </SwitchPrimitive.Root>
  )

  if (!label) return toggle

  return (
    <label className={cn(choiceLabelClass, 'gap-ds-sm', className)}>
      {toggle}
      {label}
    </label>
  )
}
