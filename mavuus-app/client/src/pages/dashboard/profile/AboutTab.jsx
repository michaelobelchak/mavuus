import { useId, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { isHttpUrl } from '@/design-system/lib/safeUrl'
import { DescriptionList, FormField } from '@/design-system/patterns'
import { RecommendationCard, ReviewCard } from '@/design-system/organisms'
import { Button, Caption, Chip, Input, Link, Select, Text, Textarea } from '@/design-system/primitives'
import { DetailSection } from '../shared/DetailSection'
import { recommendationCardProps, reviewCardProps } from '../shared/reviewProps'
import { EditableSection } from './EditableSection'
import { INDUSTRY_OPTIONS, SKILL_SUGGESTIONS, badLink, badYears, tooLong } from './profileFields'

const NOT_SET = (
  <Text as="span" size="body-sm" tone="muted">
    Not set
  </Text>
)
const shown = (value) => (value === null || value === undefined || value === '' ? NOT_SET : value)
const linkOrNotSet = (url) =>
  url ? (
    isHttpUrl(url) ? (
      <Link href={url} className="break-all">
        {url}
      </Link>
    ) : (
      url
    )
  ) : (
    NOT_SET
  )

const PERSONAL_FIELDS = [
  { key: 'name', label: 'Full name', max: 200, required: true },
  { key: 'title', label: 'Job title', max: 200 },
  { key: 'company', label: 'Company', max: 200 },
  { key: 'location', label: 'Location', max: 200, placeholder: 'e.g. New York, NY' },
  { key: 'timezone', label: 'Time zone', max: 100, placeholder: 'e.g. America/New_York' },
]

function PersonalSection({ profile, onSave }) {
  return (
    <EditableSection
      title="Personal information"
      editLabel="Edit personal information"
      view={<DescriptionList items={PERSONAL_FIELDS.map(({ key, label }) => ({ key, label, value: shown(profile[key]) }))} />}
      initial={() => Object.fromEntries(PERSONAL_FIELDS.map(({ key }) => [key, profile[key] || '']))}
      validate={(values) =>
        Object.fromEntries(
          PERSONAL_FIELDS.map(({ key, max, required }) => [
            key,
            required && !values[key].trim() ? 'Enter your name.' : tooLong(values[key], max),
          ]),
        )
      }
      save={onSave}
    >
      {({ values, errors, set }) => (
        <div className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
          {PERSONAL_FIELDS.map(({ key, label, required, placeholder }) => (
            <FormField key={key} label={label} required={required} error={errors[key] || undefined}>
              <Input value={values[key]} onChange={(event) => set(key, event.target.value)} placeholder={placeholder} />
            </FormField>
          ))}
        </div>
      )}
    </EditableSection>
  )
}

function AboutSection({ profile, onSave }) {
  const industries = INDUSTRY_OPTIONS.includes(profile.industry) || !profile.industry
    ? INDUSTRY_OPTIONS
    : [profile.industry, ...INDUSTRY_OPTIONS]
  return (
    <EditableSection
      title="About"
      editLabel="Edit about"
      view={
        <div className="flex flex-col gap-ds-md">
          {profile.bio ? (
            <Text size="body-sm" tone="secondary" className="whitespace-pre-line">
              {profile.bio}
            </Text>
          ) : (
            <Text size="body-sm" tone="muted">
              No bio yet. Add a few lines so members know what you work on.
            </Text>
          )}
          <DescriptionList
            items={[
              { key: 'industry', label: 'Industry', value: shown(profile.industry) },
              { key: 'years', label: 'Years of experience', value: shown(profile.years_experience) },
              { key: 'linkedin', label: 'LinkedIn', value: linkOrNotSet(profile.linkedin_url) },
              { key: 'website', label: 'Website', value: linkOrNotSet(profile.website_url) },
            ]}
          />
        </div>
      }
      initial={() => ({
        bio: profile.bio || '',
        industry: profile.industry || '',
        years_experience: profile.years_experience ?? '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
      })}
      validate={(values) => ({
        bio: tooLong(values.bio, 2000),
        years_experience: badYears(values.years_experience),
        linkedin_url: badLink(values.linkedin_url) || tooLong(values.linkedin_url, 500),
        website_url: badLink(values.website_url) || tooLong(values.website_url, 500),
      })}
      save={(changed) =>
        onSave(
          'years_experience' in changed && changed.years_experience !== ''
            ? { ...changed, years_experience: Number(changed.years_experience) }
            : changed,
        )
      }
    >
      {({ values, errors, set }) => (
        <>
          <FormField label="Bio" hint={`${values.bio.length} of 2,000 characters`} error={errors.bio || undefined}>
            <Textarea value={values.bio} onChange={(event) => set('bio', event.target.value)} rows={5} autoGrow maxRows={12} />
          </FormField>
          <div className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
            <FormField label="Industry">
              <Select
                placeholder="Pick an industry"
                items={industries.map((value) => ({ value, label: value }))}
                value={values.industry || null}
                onValueChange={(value) => set('industry', value || '')}
              />
            </FormField>
            <FormField label="Years of experience" error={errors.years_experience || undefined}>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={70}
                value={values.years_experience}
                onChange={(event) => set('years_experience', event.target.value)}
              />
            </FormField>
            <FormField label="LinkedIn" error={errors.linkedin_url || undefined}>
              <Input
                type="url"
                value={values.linkedin_url}
                onChange={(event) => set('linkedin_url', event.target.value)}
                placeholder="https://linkedin.com/in/you"
              />
            </FormField>
            <FormField label="Website" error={errors.website_url || undefined}>
              <Input
                type="url"
                value={values.website_url}
                onChange={(event) => set('website_url', event.target.value)}
                placeholder="https://example.com"
              />
            </FormField>
          </div>
        </>
      )}
    </EditableSection>
  )
}

/**
 * Skills save one at a time, as before: Add posts the skill, a chip's remove button deletes it.
 * Suggestions are one-click adds of common skills the member doesn't have yet.
 */
function SkillsSection({ skills, onAdd, onRemove }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const busyRef = useRef(false)
  const suggestionsId = useId()
  const has = (skill) => skills.some((s) => s.toLowerCase() === skill.toLowerCase())

  const run = async (key, task) => {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(key)
    try {
      return await task()
    } finally {
      busyRef.current = false
      setBusy(null)
    }
  }

  const add = async (raw) => {
    const skill = raw.trim()
    if (!skill) return
    if (skill.length > 50) {
      setError('Keep a skill to 50 characters or fewer.')
      return
    }
    if (has(skill)) {
      setError(`${skill} is already on your profile.`)
      return
    }
    const added = await run(`add:${skill}`, () => onAdd(skill))
    if (added) {
      setText('')
      setError('')
    }
  }

  const suggestions = SKILL_SUGGESTIONS.filter((skill) => !has(skill)).slice(0, 8)

  return (
    <DetailSection title="Skills and expertise">
      {skills.length === 0 ? (
        <Text size="body-sm" tone="muted">
          No skills yet. Add at least three so members can find you.
        </Text>
      ) : (
        <ul aria-label="Your skills" className="flex flex-wrap gap-ds-xs">
          {skills.map((skill) => (
            <li key={skill}>
              <Chip
                size="xs"
                trailingIcon={X}
                aria-label={`Remove ${skill}`}
                disabled={busy === `remove:${skill}`}
                onClick={() => run(`remove:${skill}`, () => onRemove(skill))}
              >
                {skill}
              </Chip>
            </li>
          ))}
        </ul>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          add(text)
        }}
        className="flex flex-col gap-ds-sm sm:flex-row sm:items-start"
      >
        <FormField label="Add a skill" error={error || undefined} className="grow">
          <Input
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError('')
            }}
            placeholder="e.g. Lifecycle Marketing"
          />
        </FormField>
        <Button type="submit" variant="outline" leadingIcon={Plus} disabled={!text.trim()} loading={busy === `add:${text.trim()}`} className="sm:mt-ds-xl">
          Add
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-ds-xs">
          <Caption id={suggestionsId}>Suggestions</Caption>
          <ul aria-labelledby={suggestionsId} className="flex flex-wrap gap-ds-xs">
            {suggestions.map((skill) => (
              <li key={skill}>
                <Chip size="xs" leadingIcon={Plus} aria-label={`Add ${skill}`} onClick={() => add(skill)}>
                  {skill}
                </Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DetailSection>
  )
}

/** The About tab: personal details, about, skills, and the member's reviews and recommendations. */
export function AboutTab({ profile, reviews, recommendations, onSave, onAddSkill, onRemoveSkill }) {
  return (
    <div className="flex flex-col gap-ds-lg">
      <PersonalSection profile={profile} onSave={onSave} />
      <AboutSection profile={profile} onSave={onSave} />
      <SkillsSection skills={profile.skills || []} onAdd={onAddSkill} onRemove={onRemoveSkill} />
      {reviews.length > 0 && (
        <DetailSection title="Ratings and reviews">
          <ul className="flex flex-col gap-ds-sm">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard {...reviewCardProps(review)} />
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
      {recommendations.length > 0 && (
        <DetailSection title="Recommendations">
          <ul className="flex flex-col gap-ds-sm">
            {recommendations.map((rec) => (
              <li key={rec.id}>
                <RecommendationCard {...recommendationCardProps(rec)} />
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
    </div>
  )
}
