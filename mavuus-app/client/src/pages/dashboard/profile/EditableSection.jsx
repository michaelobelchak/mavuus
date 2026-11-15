import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Alert } from '@/design-system/patterns'
import { Button } from '@/design-system/primitives'
import { DetailSection } from '../shared/DetailSection'
import { changedKeys } from './profileFields'

/**
 * A profile card that shows the saved values and turns into a form on Edit.
 * - `title`, `editLabel` (the Edit button's name, "Edit personal information"), `view` (read mode).
 * - `initial()`: the form's starting values. `validate(values)`: `{ field: message }` for problems.
 * - `save(changedValues, values)`: resolves when saved; throw an Error to show its message. Only
 *   changed fields are passed. Save stays off until something changed.
 * - `stepKey`: the profile completion step whose button focuses Edit (`data-profile-step`).
 * - `children({ values, errors, set })`: the fields. `set(key, value)` clears that field's error.
 * Focus goes to the first field on Edit and back to Edit after Save or Cancel.
 */
export function EditableSection({ title, editLabel, view, initial, validate, save, stepKey, children }) {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const formRef = useRef(null)
  const editRef = useRef(null)
  const focusEdit = useRef(false)
  const [startValues, setStartValues] = useState(null)

  useEffect(() => {
    if (editing) formRef.current?.querySelector('input, textarea, button[role="combobox"]')?.focus()
    else if (focusEdit.current) {
      focusEdit.current = false
      editRef.current?.focus()
    }
  }, [editing])

  const open = () => {
    const first = initial()
    setStartValues(first)
    setValues(first)
    setErrors({})
    setFormError('')
    setEditing(true)
  }
  const close = () => {
    focusEdit.current = true
    setEditing(false)
  }
  const set = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  const changed = editing ? changedKeys(startValues, values) : []
  const submit = async (event) => {
    event.preventDefault()
    if (savingRef.current || changed.length === 0) return
    const found = validate ? validate(values) : {}
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      return
    }
    savingRef.current = true
    setSaving(true)
    setFormError('')
    try {
      await save(Object.fromEntries(changed.map((key) => [key, values[key]])), values)
      close()
    } catch (err) {
      setFormError(err?.message || "Couldn't save your changes. Try again.")
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <DetailSection
      title={title}
      actions={
        !editing && (
          <Button ref={editRef} variant="outline" size="sm" leadingIcon={Pencil} aria-label={editLabel} data-profile-step={stepKey} onClick={open}>
            Edit
          </Button>
        )
      }
    >
      {editing ? (
        <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-ds-md">
          {formError && <Alert tone="error" title="Not saved" description={formError} />}
          {children({ values, errors, set })}
          <div className="flex flex-wrap gap-ds-sm">
            <Button type="submit" loading={saving} disabled={changed.length === 0}>
              Save changes
            </Button>
            <Button variant="ghost" onClick={close} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        view
      )}
    </DetailSection>
  )
}
