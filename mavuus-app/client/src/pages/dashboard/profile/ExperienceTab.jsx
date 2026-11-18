import { useId, useRef, useState } from 'react'
import { Briefcase, FileText, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { Alert, Card, Dialog, DialogClose, EmptyState, FormField, SectionHeader } from '@/design-system/patterns'
import { Button, Caption, Checkbox, Heading, Icon, IconButton, Input, Link, Text, Textarea } from '@/design-system/primitives'
import { DetailSection } from '../shared/DetailSection'
import { resumeHref } from '../shared/resumeHref'
import { RESUME_MAX_BYTES, monthLabel, tooLong } from './profileFields'

const EMPTY_FORM = { title: '', company: '', start_date: '', end_date: '', is_current: false, description: '' }

const period = (exp) => `${monthLabel(exp.start_date) || 'Start not set'} to ${exp.is_current ? 'Present' : monthLabel(exp.end_date) || 'End not set'}`

function validateExperience(form) {
  const errors = {
    title: !form.title.trim() ? 'Enter a job title.' : tooLong(form.title, 200),
    company: !form.company.trim() ? 'Enter a company.' : tooLong(form.company, 200),
    description: tooLong(form.description, 5000),
  }
  if (!form.is_current && form.start_date && form.end_date && form.end_date < form.start_date) {
    errors.end_date = 'The end date is before the start date.'
  }
  return errors
}

/** Add or edit one role. Errors show on the fields; a refused save keeps the dialog open with the reason. */
function ExperienceDialog({ open, onOpenChange, editing, onSave }) {
  const formId = useId()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [lastOpen, setLastOpen] = useState(false)

  // A fresh form each time the dialog opens (adjusting state while rendering, not in an effect).
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setForm(
        editing
          ? {
              title: editing.title || '',
              company: editing.company || '',
              start_date: editing.start_date || '',
              end_date: editing.end_date || '',
              is_current: Boolean(editing.is_current),
              description: editing.description || '',
            }
          : EMPTY_FORM,
      )
      setErrors({})
      setFormError('')
    }
  }

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (savingRef.current) return
    const found = validateExperience(form)
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      return
    }
    savingRef.current = true
    setSaving(true)
    setFormError('')
    try {
      await onSave({ ...form, title: form.title.trim(), company: form.company.trim(), end_date: form.is_current ? '' : form.end_date })
      onOpenChange(false)
    } catch (err) {
      setFormError(err?.message || "Couldn't save this role. Try again.")
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={editing ? 'Edit experience' : 'Add experience'}
      footer={
        <>
          <DialogClose>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={formId} loading={saving}>
            {editing ? 'Save changes' : 'Add experience'}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-ds-md">
        {formError && <Alert tone="error" title="Not saved" description={formError} />}
        <FormField label="Job title" required error={errors.title || undefined}>
          <Input value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="e.g. VP of Marketing" />
        </FormField>
        <FormField label="Company" required error={errors.company || undefined}>
          <Input value={form.company} onChange={(event) => set('company', event.target.value)} placeholder="e.g. TechFlow" />
        </FormField>
        <div className="grid grid-cols-1 gap-ds-md sm:grid-cols-2">
          <FormField label="Start month" hint="Month and year">
            <Input type="month" value={form.start_date} onChange={(event) => set('start_date', event.target.value)} />
          </FormField>
          <FormField label="End month" hint={form.is_current ? 'You work here now' : 'Month and year'} error={errors.end_date || undefined}>
            <Input
              type="month"
              value={form.is_current ? '' : form.end_date}
              disabled={form.is_current}
              onChange={(event) => set('end_date', event.target.value)}
            />
          </FormField>
        </div>
        <Checkbox
          label="I currently work here"
          checked={form.is_current}
          onCheckedChange={(checked) => {
            set('is_current', Boolean(checked))
            if (checked) set('end_date', '')
          }}
        />
        <FormField label="Description" error={errors.description || undefined}>
          <Textarea
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={4}
            placeholder="What you did and what changed because of it"
          />
        </FormField>
      </form>
    </Dialog>
  )
}

/** Confirms removing a role; a failure keeps the dialog open with an error. */
function DeleteDialog({ target, onOpenChange, onDelete, finalFocus }) {
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const busy = useRef(false)
  const [lastTarget, setLastTarget] = useState(null)
  if (target !== lastTarget) {
    setLastTarget(target)
    if (target) setError('')
  }
  const confirm = async () => {
    if (busy.current || !target) return
    busy.current = true
    setDeleting(true)
    setError('')
    try {
      await onDelete(target)
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Couldn't remove this role. Try again.")
    } finally {
      busy.current = false
      setDeleting(false)
    }
  }
  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={onOpenChange}
      size="sm"
      finalFocus={finalFocus}
      title="Remove this role?"
      description={target ? `${target.title} at ${target.company} will be removed from your profile. This can't be undone.` : undefined}
      footer={
        <>
          <DialogClose>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="danger" loading={deleting} onClick={confirm}>
            Remove
          </Button>
        </>
      }
    >
      {error && <Alert tone="error" title="Not removed" description={error} />}
    </Dialog>
  )
}

/** The resume: a link to the private file with Replace and Remove, or an upload button. PDF, 5 MB max. */
function ResumeSection({ filename, url, onUpload, onRemove }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(null)
  const busyRef = useRef(false)
  const [error, setError] = useState('')
  const href = resumeHref(url)

  const run = async (kind, task) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(kind)
    try {
      await task()
    } finally {
      busyRef.current = false
      setBusy(null)
    }
  }

  const pick = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Upload a PDF file.')
      return
    }
    if (file.size > RESUME_MAX_BYTES) {
      setError('The file is over 5 MB. Upload a smaller PDF.')
      return
    }
    setError('')
    run('upload', () => onUpload(file))
  }

  const chooseLabel = filename ? 'Replace' : 'Upload resume'
  return (
    <DetailSection title="Resume">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" aria-label="Resume file" className="hidden" onChange={pick} />
      {filename ? (
        <div className="flex flex-col gap-ds-sm rounded-control bg-surface-sunken p-ds-sm sm:flex-row sm:items-center">
          <span className="flex min-w-0 grow items-center gap-ds-sm">
            <Icon icon={FileText} size="md" className="shrink-0 text-text-brand-strong" />
            {href ? (
              <Link href={href} target="_blank" rel="noopener" className="truncate">
                {filename}
              </Link>
            ) : (
              <Text as="span" size="body-sm" className="truncate font-semibold">
                {filename}
              </Text>
            )}
          </span>
          <div className="flex shrink-0 gap-ds-xs">
            <Button size="sm" variant="outline" leadingIcon={Upload} loading={busy === 'upload'} disabled={Boolean(busy)} onClick={() => inputRef.current?.click()}>
              {chooseLabel}
            </Button>
            <Button size="sm" variant="ghost" leadingIcon={Trash2} loading={busy === 'remove'} disabled={Boolean(busy)} onClick={() => run('remove', onRemove)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-ds-sm rounded-control border border-dashed border-border-default p-ds-lg">
          <Text size="body-sm" tone="secondary">
            Add your resume so employers you apply to can read it.
          </Text>
          <Button variant="outline" leadingIcon={Upload} loading={busy === 'upload'} data-profile-step="resume" onClick={() => inputRef.current?.click()}>
            {chooseLabel}
          </Button>
        </div>
      )}
      <Caption>PDF only, up to 5 MB.</Caption>
      {error && (
        <Text role="alert" size="body-sm" tone="error">
          {error}
        </Text>
      )}
    </DetailSection>
  )
}

/** The Experience tab: roles (add, edit, remove) and the resume. */
export function ExperienceTab({ profile, onSaveExperience, onDeleteExperience, onUploadResume, onRemoveResume }) {
  const [dialog, setDialog] = useState({ open: false, editing: null })
  const [deleting, setDeleting] = useState(null)
  // The one Add experience button on screen (header or empty state); focus lands here after a delete.
  const addRef = useRef(null)
  const experience = profile.experience || []
  const add = (
    <Button ref={addRef} data-profile-step="experience" leadingIcon={Plus} onClick={() => setDialog({ open: true, editing: null })}>
      Add experience
    </Button>
  )
  return (
    <div className="flex flex-col gap-ds-lg">
      <SectionHeader title="Work experience" headingLevel={2} size="h3" actions={experience.length > 0 && add} />
      {experience.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            size="sm"
            headingLevel={3}
            icon={Briefcase}
            title="No experience yet"
            description="Add the roles you've held so members and employers see your background."
            actions={add}
          />
        </Card>
      ) : (
        <ul aria-label="Your roles" className="flex flex-col gap-ds-sm">
          {experience.map((exp) => (
            <li key={exp.id}>
              <Card padding="md" className="flex gap-ds-sm">
                <span className="hidden size-10 shrink-0 items-center justify-center rounded-control bg-surface-selected text-text-brand-strong sm:inline-flex">
                  <Icon icon={Briefcase} size="md" />
                </span>
                <div className="flex min-w-0 grow flex-col gap-ds-xxs">
                  <Heading level={3} size="h4">
                    {exp.title}
                  </Heading>
                  <Text size="body-sm" tone="secondary">
                    {exp.company}
                  </Text>
                  <Caption>{period(exp)}</Caption>
                  {exp.description && (
                    <Text size="body-sm" tone="secondary" className="mt-ds-xs whitespace-pre-line">
                      {exp.description}
                    </Text>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-ds-xxs">
                  <IconButton icon={Pencil} size="sm" aria-label={`Edit ${exp.title} at ${exp.company}`} onClick={() => setDialog({ open: true, editing: exp })} />
                  <IconButton icon={Trash2} size="sm" aria-label={`Delete ${exp.title} at ${exp.company}`} onClick={() => setDeleting(exp)} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ResumeSection filename={profile.resume_filename} url={profile.resume_url} onUpload={onUploadResume} onRemove={onRemoveResume} />

      <ExperienceDialog
        open={dialog.open}
        editing={dialog.editing}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        onSave={(form) => onSaveExperience(dialog.editing, form)}
      />
      <DeleteDialog target={deleting} onOpenChange={(open) => !open && setDeleting(null)} onDelete={onDeleteExperience} finalFocus={addRef} />
    </div>
  )
}
