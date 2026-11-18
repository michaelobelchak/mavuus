import { useEffect, useId, useRef, useState } from 'react'
import { Briefcase, Calendar, Camera, MapPin, Users } from 'lucide-react'
import { Card } from '@/design-system/patterns'
import { MetaList } from '@/design-system/organisms'
import { Avatar, Badge, Button, Heading, Link, ProgressBar, Text } from '@/design-system/primitives'
import { formatDate } from '@/design-system/lib/formatDate'
import { MEMBERS_PATH } from '../shared/paths'
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from './profileFields'

/**
 * The profile's top card: photo (Change photo checks the type and size, shows a preview while it
 * uploads and goes back to the old photo if the upload fails), name, role, plan, quick facts and,
 * until the profile is complete, what's left with a button to the tab where it's done.
 */
export function ProfileHeader({ profile, completion, onUploadAvatar, onStep }) {
  const inputRef = useRef(null)
  const errorId = useId()
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)
  useEffect(() => () => preview && URL.revokeObjectURL?.(preview), [preview])

  const pick = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || busy.current) return
    if (!AVATAR_TYPES.includes(file.type)) {
      setError('Use a JPEG, PNG, WebP or GIF image.')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError('The image is over 2 MB. Pick a smaller one.')
      return
    }
    setError('')
    busy.current = true
    setUploading(true)
    setPreview(URL.createObjectURL ? URL.createObjectURL(file) : null)
    try {
      await onUploadAvatar(file)
    } finally {
      busy.current = false
      setUploading(false)
      setPreview(null)
    }
  }

  const pro = profile.membership_tier === 'pro'
  const role = [profile.title, profile.company].filter(Boolean).join(' at ')
  const connections = profile.connections_count || 0
  return (
    <Card as="section" aria-label="Profile summary" padding="lg" className="flex flex-col gap-ds-lg">
      <div className="flex flex-col gap-ds-md sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-row items-center gap-ds-sm sm:flex-col">
          <Avatar name={profile.name} src={preview || profile.avatar_url} size="lg" className={uploading ? 'opacity-60' : undefined} />
          <input
            ref={inputRef}
            type="file"
            accept={AVATAR_TYPES.join(',')}
            aria-label="Profile photo file"
            className="hidden"
            onChange={pick}
          />
          <Button
            size="sm"
            variant="outline"
            leadingIcon={Camera}
            loading={uploading}
            aria-describedby={error ? errorId : undefined}
            onClick={() => inputRef.current?.click()}
          >
            Change photo
          </Button>
        </div>
        <div className="flex min-w-0 grow flex-col gap-ds-xs">
          <div className="flex flex-wrap items-center gap-ds-xs">
            <Heading level={2} size="h3">
              {profile.name}
            </Heading>
            <Badge size="sm" tone={pro ? 'brand' : 'neutral'}>
              {pro ? 'Pro member' : 'Free member'}
            </Badge>
          </div>
          {role && <Text tone="secondary">{role}</Text>}
          <MetaList
            items={[
              { key: 'location', icon: MapPin, label: profile.location },
              { key: 'industry', icon: Briefcase, label: profile.industry },
              { key: 'since', icon: Calendar, label: profile.created_at && `Member since ${formatDate(profile.created_at, { month: 'long', year: 'numeric' })}` },
              {
                key: 'connections',
                icon: Users,
                label: connections > 0 && (
                  <Link to={`${MEMBERS_PATH}?filter=connections`}>{`${connections} connection${connections === 1 ? '' : 's'}`}</Link>
                ),
              },
            ]}
          />
          {error && (
            <Text id={errorId} role="alert" size="body-sm" tone="error">
              {error}
            </Text>
          )}
        </div>
      </div>
      {completion && completion.percent < 100 && (
        <div className="flex flex-col gap-ds-sm border-t border-border-subtle pt-ds-md">
          <ProgressBar value={completion.percent} label={`Profile ${completion.percent}% complete`} showValue size="sm" className="max-w-sm" />
          <ul aria-label="To complete your profile" className="flex flex-wrap gap-ds-xs">
            {completion.steps.map((step) => (
              <li key={step.key}>
                <Button size="sm" variant="ghost" onClick={() => (step.key === 'photo' ? inputRef.current?.click() : onStep(step))}>
                  {step.action}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
