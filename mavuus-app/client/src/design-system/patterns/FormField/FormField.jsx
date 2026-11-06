import { Children, cloneElement, isValidElement, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { RequiredMark } from '../../lib/RequiredMark'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import { Icon, Label } from '../../primitives'
import { FormFieldContext } from './formFieldContext'

const LAYOUTS = ['stacked', 'inline']

function joinIds(...ids) {
  return ids.filter(Boolean).join(' ') || undefined
}

/**
 * Label, control, hint and error wired together.
 * - `children`: one control element (Input, Textarea, Select, Checkbox, RadioGroup...), cloned with
 *   `id`, `aria-describedby`, `aria-invalid` and `required`. Or a render function
 *   `({ id, labelId, describedBy, invalid, required }) => control` for anything else.
 *   The child's own `id` and `aria-describedby` are kept.
 * - `label`, `required` (asterisk plus sr-only "(required)", and `required` on the control),
 *   `hint` and `error` (a string; sets aria-invalid). The hint and error ids go in aria-describedby.
 * - `layout`: stacked (default, label above) or inline (control then label on one row, for
 *   Checkbox and Switch).
 * - `group`: the control is a group (RadioGroup, a set of checkboxes). The label renders as text
 *   that names the group through aria-labelledby instead of a <label for>.
 * The error sits in an always-mounted polite live region, so it's announced when it appears.
 * `className` and other props go to the root.
 */
export function FormField({
  label,
  required = false,
  hint,
  error,
  layout,
  group = false,
  className,
  children,
  ref,
  ...props
}) {
  const resolvedLayout = resolveOption(layout, LAYOUTS, 'stacked', 'FormField', 'layout')
  const baseId = useId()
  const child = typeof children === 'function' ? null : Children.only(children)
  const id = (isValidElement(child) && child.props.id) || `${baseId}-control`
  const labelId = `${baseId}-label`
  const hintId = hint ? `${baseId}-hint` : undefined
  const errorId = error ? `${baseId}-error` : undefined
  const invalid = Boolean(error)
  const describedBy = joinIds(child?.props?.['aria-describedby'], hintId, errorId)

  if (child?.props?.label !== undefined) {
    warnOnce(
      'FormField:child-label',
      'FormField: the control also has a label prop, so it gets two labels. Drop the label prop and let FormField label it.',
    )
  }

  const control =
    typeof children === 'function'
      ? children({ id, labelId, describedBy, invalid, required })
      : cloneElement(child, {
          id,
          'aria-describedby': describedBy,
          'aria-invalid': invalid ? true : child.props['aria-invalid'],
          'aria-labelledby': group ? labelId : child.props['aria-labelledby'],
          required: required || child.props.required,
        })

  const labelNode = group ? (
    <span id={labelId} className="text-body-sm font-semibold text-text-primary">
      {label}
      {required && <RequiredMark />}
    </span>
  ) : (
    <Label id={labelId} htmlFor={id} required={required} className={resolvedLayout === 'inline' && 'cursor-pointer font-normal text-body'}>
      {label}
    </Label>
  )

  const messages = (
    <>
      {hint && (
        <p id={hintId} className="m-ds-none text-body-sm text-text-secondary">
          {hint}
        </p>
      )}
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="m-ds-none flex items-start gap-ds-xxs text-body-sm text-status-error">
            <Icon icon={AlertCircle} size="sm" className="mt-ds-xxs" />
            {error}
          </p>
        )}
      </div>
    </>
  )

  // A group is named by aria-labelledby on the cloned child; anything else by the <label for>.
  const context = { controlId: id, labelled: !group }

  if (resolvedLayout === 'inline') {
    return (
      <FormFieldContext value={context}>
        <div ref={ref} className={cn('flex flex-col gap-ds-xxs', className)} {...props}>
          <div className="flex min-h-11 items-center gap-ds-sm">
            {control}
            {labelNode}
          </div>
          {messages}
        </div>
      </FormFieldContext>
    )
  }

  return (
    <FormFieldContext value={context}>
      <div ref={ref} className={cn('flex flex-col gap-ds-xs', className)} {...props}>
        {labelNode}
        {control}
        {messages}
      </div>
    </FormFieldContext>
  )
}
