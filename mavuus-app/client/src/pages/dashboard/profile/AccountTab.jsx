import { useRef, useState } from 'react'
import { Alert, DescriptionList, FormField } from '@/design-system/patterns'
import { Button, Caption, Input, RadioGroup, Switch } from '@/design-system/primitives'
import { DetailSection } from '../shared/DetailSection'
import { VISIBILITY_OPTIONS, passwordProblem } from './profileFields'

const NOTIFICATIONS = [
  { key: 'notification_email', label: 'Email updates', description: 'News and activity from Mavuus by email' },
  { key: 'notification_messages', label: 'Messages', description: 'When someone sends you a message' },
  { key: 'notification_connections', label: 'Connections', description: 'Connection requests and accepted requests' },
  { key: 'notification_jobs', label: 'Jobs', description: 'Updates on your applications and new postings' },
]

/** Who can see the profile. A choice waits for Save, so a stray click doesn't change it. */
function VisibilitySection({ value, onSave }) {
  const saved = value || 'public'
  const [choice, setChoice] = useState(saved)
  const [lastSaved, setLastSaved] = useState(saved)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)
  // A newer saved value from the server resets the choice.
  if (saved !== lastSaved) {
    setLastSaved(saved)
    setChoice(saved)
  }
  const save = async () => {
    if (busy.current || choice === saved) return
    busy.current = true
    setSaving(true)
    setError('')
    try {
      await onSave({ profile_visibility: choice })
    } catch (err) {
      setError(err?.message || "Couldn't save your choice. Try again.")
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <DetailSection title="Profile visibility">
      <RadioGroup label="Who can see your profile" options={VISIBILITY_OPTIONS} value={choice} onValueChange={setChoice} />
      {error && <Alert tone="error" title="Not saved" description={error} />}
      <div className="flex flex-wrap gap-ds-sm">
        <Button onClick={save} loading={saving} disabled={choice === saved}>
          Save visibility
        </Button>
        {choice !== saved && (
          <Button variant="ghost" onClick={() => setChoice(saved)} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </DetailSection>
  )
}

/** Each switch saves right away; a failed save flips it back (the page shows the error). */
function NotificationsSection({ profile, onToggle }) {
  const [pending, setPending] = useState({})
  const toggle = async (key, checked) => {
    if (pending[key]) return
    setPending((prev) => ({ ...prev, [key]: true }))
    try {
      await onToggle(key, checked)
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }))
    }
  }
  return (
    <DetailSection title="Notifications">
      <ul className="flex flex-col gap-ds-md">
        {NOTIFICATIONS.map(({ key, label, description }) => (
          <li key={key} className="flex flex-col gap-ds-xxs">
            <Switch label={label} checked={Boolean(profile[key])} disabled={Boolean(pending[key])} onCheckedChange={(checked) => toggle(key, checked)} aria-describedby={`${key}-hint`} />
            <Caption id={`${key}-hint`}>{description}</Caption>
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' }

/** Change password: field errors before sending, and a wrong current password on its field. */
function PasswordSection({ onChange }) {
  const [form, setForm] = useState(EMPTY_PASSWORDS)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const busy = useRef(false)
  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }
  const submit = async (event) => {
    event.preventDefault()
    if (busy.current) return
    const found = {
      current: form.current ? '' : 'Enter your current password.',
      next: form.next ? passwordProblem(form.next) : 'Enter a new password.',
      confirm: !form.confirm ? 'Enter the new password again.' : form.confirm !== form.next ? "The passwords don't match." : '',
    }
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      return
    }
    busy.current = true
    setSaving(true)
    setFormError('')
    try {
      const result = await onChange(form.current, form.next)
      if (result?.field) setErrors({ [result.field]: result.message })
      else if (result?.message) setFormError(result.message)
      else setForm(EMPTY_PASSWORDS)
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <DetailSection title="Change password">
      <form noValidate onSubmit={submit} className="flex max-w-md flex-col gap-ds-md">
        {formError && <Alert tone="error" title="Password not changed" description={formError} />}
        <FormField label="Current password" required error={errors.current || undefined}>
          <Input type="password" autoComplete="current-password" value={form.current} onChange={(event) => set('current', event.target.value)} />
        </FormField>
        <FormField label="New password" required hint="At least 8 characters, with an uppercase letter and a number." error={errors.next || undefined}>
          <Input type="password" autoComplete="new-password" value={form.next} onChange={(event) => set('next', event.target.value)} />
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirm || undefined}>
          <Input type="password" autoComplete="new-password" value={form.confirm} onChange={(event) => set('confirm', event.target.value)} />
        </FormField>
        <Button type="submit" loading={saving} className="self-start">
          Update password
        </Button>
      </form>
    </DetailSection>
  )
}

/** The Account tab (linked from the account menu as ?tab=account). */
export function AccountTab({ profile, onSave, onToggleNotification, onChangePassword }) {
  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailSection title="Account">
        <DescriptionList items={[{ key: 'email', label: 'Email', value: profile.email }]} />
      </DetailSection>
      <VisibilitySection value={profile.profile_visibility} onSave={onSave} />
      <NotificationsSection profile={profile} onToggle={onToggleNotification} />
      <PasswordSection onChange={onChangePassword} />
    </div>
  )
}
