import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, Tabs, useToast } from '@/design-system/patterns'
import { Button, Skeleton } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { AboutTab } from './profile/AboutTab'
import { AccountTab } from './profile/AccountTab'
import { BillingTab } from './profile/BillingTab'
import { ExperienceTab } from './profile/ExperienceTab'
import { ProfileHeader } from './profile/ProfileHeader'
import { errorMessage } from './shared/errorMessage'
import { profileCompletion } from './shared/profileCompletion'
import { listOf } from './shared/reviewProps'

const TABS = ['about', 'experience', 'account', 'billing']
const TAB_LABELS = { about: 'About', experience: 'Experience', account: 'Account', billing: 'Billing' }
// Fields that also live on the signed-in user (the shell's name and menu).
const USER_FIELDS = ['name', 'title', 'company']

/** Throws the server's error text (or `fallback`) for a refused response. */
async function ensureOk(res, fallback) {
  if (!res.ok) throw new Error(await errorMessage(res, fallback))
  return res
}

/**
 * The member's own profile: a summary card with the photo and completion, then About, Experience,
 * Account and Billing tabs. The tab is in the URL (`?tab=account` is linked from the account menu).
 * Every save goes through the same endpoints as before; forms check their fields first.
 */
export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TABS.includes(requested) ? requested : 'about'
  const [state, setState] = useState({ status: 'loading', profile: null })
  const [extras, setExtras] = useState({ reviews: [], recommendations: [] })
  const auth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const json = useMemo(() => ({ ...auth, 'Content-Type': 'application/json' }), [auth])
  const profile = state.profile

  const load = useCallback(
    async (signal) => {
      try {
        const res = await fetch('/api/profile/me', { headers: auth, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!signal?.aborted) setState({ status: 'ready', profile: data })
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return
        // A failed reload after a save keeps the profile on screen.
        setState((prev) => (prev.profile ? prev : { status: 'error', profile: null }))
      }
    },
    [auth],
  )
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  // Reviews and recommendations only add sections; when they fail the sections stay hidden.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return undefined
    const controller = new AbortController()
    const get = (url) =>
      fetch(url, { headers: auth, signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then(listOf)
        .catch(() => [])
    Promise.all([get(`/api/reviews/user/${userId}`), get(`/api/recommendations/user/${userId}`)]).then(([reviews, recommendations]) => {
      if (!controller.signal.aborted) setExtras({ reviews, recommendations })
    })
    return () => controller.abort()
  }, [userId, auth])

  const patch = (fields) => setState((prev) => (prev.profile ? { ...prev, profile: { ...prev.profile, ...fields } } : prev))

  const changeTab = (next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next === 'about') params.delete('tab')
      else params.set('tab', next)
      return params
    })
  }

  const saveProfile = async (fields) => {
    const res = await fetch('/api/profile/me', { method: 'PUT', headers: json, body: JSON.stringify(fields) })
    await ensureOk(res, "Couldn't save your profile. Try again.")
    patch(fields)
    const forUser = Object.fromEntries(Object.entries(fields).filter(([key]) => USER_FIELDS.includes(key)))
    if (Object.keys(forUser).length > 0) updateUser(forUser)
    toast.success('Profile updated')
    load()
  }

  const addSkill = async (skill) => {
    try {
      const res = await fetch('/api/profile/me/skills', { method: 'POST', headers: json, body: JSON.stringify({ skill }) })
      await ensureOk(res, "Couldn't add that skill. Try again.")
      setState((prev) => ({ ...prev, profile: { ...prev.profile, skills: [...(prev.profile.skills || []), skill] } }))
      return true
    } catch (err) {
      toast.error(err.message || "Couldn't add that skill. Try again.")
      return false
    }
  }

  const removeSkill = async (skill) => {
    try {
      const res = await fetch(`/api/profile/me/skills/${encodeURIComponent(skill)}`, { method: 'DELETE', headers: auth })
      await ensureOk(res, "Couldn't remove that skill. Try again.")
      setState((prev) => ({ ...prev, profile: { ...prev.profile, skills: (prev.profile.skills || []).filter((s) => s !== skill) } }))
    } catch (err) {
      toast.error(err.message || "Couldn't remove that skill. Try again.")
    }
  }

  const saveExperience = async (editing, form) => {
    const res = await fetch(editing ? `/api/profile/me/experience/${editing.id}` : '/api/profile/me/experience', {
      method: editing ? 'PUT' : 'POST',
      headers: json,
      body: JSON.stringify(form),
    })
    await ensureOk(res, "Couldn't save this role. Try again.")
    toast.success(editing ? 'Experience updated' : 'Experience added')
    await load()
  }

  const deleteExperience = async (exp) => {
    const res = await fetch(`/api/profile/me/experience/${exp.id}`, { method: 'DELETE', headers: auth })
    await ensureOk(res, "Couldn't remove this role. Try again.")
    toast.success('Experience removed')
    await load()
  }

  const uploadResume = async (file) => {
    try {
      const body = new FormData()
      body.append('resume', file)
      const res = await fetch('/api/profile/me/resume', { method: 'POST', headers: auth, body })
      await ensureOk(res, 'Upload failed. Try again.')
      const data = await res.json()
      patch({ resume_filename: data.filename, resume_url: data.url })
      toast.success('Resume uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed. Try again.')
    }
  }

  const removeResume = async () => {
    try {
      const res = await fetch('/api/profile/me/resume', { method: 'DELETE', headers: auth })
      await ensureOk(res, "Couldn't remove your resume. Try again.")
      patch({ resume_filename: null, resume_url: null })
      toast.success('Resume removed')
    } catch (err) {
      toast.error(err.message || "Couldn't remove your resume. Try again.")
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const body = new FormData()
      body.append('avatar', file)
      const res = await fetch('/api/profile/me/avatar', { method: 'POST', headers: auth, body })
      await ensureOk(res, 'Upload failed. Try again.')
      const data = await res.json()
      patch({ avatar_url: data.avatar_url })
      updateUser({ avatar_url: data.avatar_url })
      toast.success('Photo updated')
    } catch (err) {
      toast.error(err.message || 'Upload failed. Try again.')
    }
  }

  const toggleNotification = async (key, checked) => {
    const previous = profile[key]
    patch({ [key]: checked ? 1 : 0 })
    try {
      const res = await fetch('/api/profile/me', { method: 'PUT', headers: json, body: JSON.stringify({ [key]: checked ? 1 : 0 }) })
      await ensureOk(res, "Couldn't save that setting. Try again.")
      toast.success('Notification settings saved')
    } catch (err) {
      patch({ [key]: previous })
      toast.error(err.message || "Couldn't save that setting. Try again.")
    }
  }

  // Resolves null when changed, or { field, message } / { message } for the form to show.
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: json,
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success('Password updated')
        return null
      }
      const message = await errorMessage(res, "Couldn't update your password. Try again.")
      if (res.status === 401) return { field: 'current', message }
      if (res.status === 400) return { field: 'next', message }
      return { message }
    } catch {
      return { message: 'Network error. Check your connection and try again.' }
    }
  }

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" className="flex flex-col gap-ds-lg">
        <p role="status" className="sr-only">
          Loading your profile
        </p>
        <Skeleton shape="rect" className="h-48 rounded-card" />
        <Skeleton shape="rect" className="h-12 max-w-md" />
        <Skeleton shape="rect" className="h-72 rounded-card" />
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <Alert
        tone="error"
        title="We couldn't load your profile"
        description="Check your connection and try again."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState({ status: 'loading', profile: null })
              load()
            }}
          >
            Try again
          </Button>
        }
      />
    )
  }

  const content = {
    about: (
      <AboutTab
        profile={profile}
        reviews={extras.reviews}
        recommendations={extras.recommendations}
        onSave={saveProfile}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
      />
    ),
    experience: (
      <ExperienceTab
        profile={profile}
        onSaveExperience={saveExperience}
        onDeleteExperience={deleteExperience}
        onUploadResume={uploadResume}
        onRemoveResume={removeResume}
      />
    ),
    account: (
      <AccountTab profile={profile} onSave={saveProfile} onToggleNotification={toggleNotification} onChangePassword={changePassword} />
    ),
    billing: <BillingTab tier={profile.membership_tier} />,
  }

  return (
    <div className="flex max-w-5xl flex-col gap-ds-lg">
      <ProfileHeader
        profile={profile}
        completion={profileCompletion(profile)}
        onUploadAvatar={uploadAvatar}
        onStep={(step) => changeTab(step.tab)}
      />
      <Tabs
        aria-label="Profile sections"
        items={TABS.map((value) => ({ value, label: TAB_LABELS[value], content: content[value] }))}
        value={tab}
        onValueChange={changeTab}
        listClassName="overflow-x-auto"
        panelClassName="pt-ds-lg"
      />
    </div>
  )
}
