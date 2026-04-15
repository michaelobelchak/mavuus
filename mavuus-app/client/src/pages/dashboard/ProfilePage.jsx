import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import Select from '../../components/ui/Select'
import TagInput from '../../components/ui/TagInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input, { Textarea } from '../../components/ui/Input'
import ReviewCard from '../../components/ui/ReviewCard'
import RecommendationCard from '../../components/ui/RecommendationCard'
import ProgressRing from '../../components/ui/ProgressRing'
import {
  Pencil, MapPin, Calendar, Briefcase, ExternalLink,
  Plus, Trash2, GraduationCap, FileText, Upload,
  CreditCard, Shield, Users, Star, ThumbsUp,
} from 'lucide-react'

const INDUSTRY_OPTIONS = [
  'Technology', 'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
  'Marketing Technology', 'Cloud Computing', 'Entertainment', 'Media',
  'Professional Services', 'Design & Tech', 'Productivity Software', 'Communications',
]

const SKILL_SUGGESTIONS = [
  'Content Strategy', 'SEO', 'B2B Marketing', 'Revenue Marketing', 'ABM',
  'Demand Generation', 'Marketing Analytics', 'Brand Strategy', 'Growth Marketing',
  'Product Marketing', 'Digital Marketing', 'Social Media', 'Paid Media',
  'Marketing Automation', 'Content Marketing', 'E-commerce', 'DTC Marketing',
  'Performance Marketing', 'Creative Direction', 'Public Speaking', 'Leadership',
  'A/B Testing', 'Conversion Optimization', 'Product-Led Growth', 'Community Building',
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public — visible to all members' },
  { value: 'connections', label: 'Connections only' },
  { value: 'private', label: 'Private — hidden from directory' },
]

// Profile completion checks — used for ProgressRing display
function computeCompletion(profile) {
  if (!profile) return { percent: 0, missing: [] }
  const checks = [
    { ok: !!profile.avatar_url, label: 'Add a profile photo', tab: 'about' },
    { ok: !!(profile.bio && profile.bio.trim()), label: 'Write a short bio', tab: 'about' },
    { ok: (profile.skills?.length || 0) >= 3, label: 'Add at least 3 skills', tab: 'about' },
    { ok: (profile.experience?.length || 0) >= 1, label: 'Add work experience', tab: 'experience' },
    { ok: !!profile.resume_filename, label: 'Upload your resume', tab: 'experience' },
  ]
  const done = checks.filter((c) => c.ok).length
  return {
    percent: Math.round((done / checks.length) * 100),
    done,
    total: checks.length,
    missing: checks.filter((c) => !c.ok),
  }
}

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'about')

  // Inline edit state
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Experience modal state
  const [showExpModal, setShowExpModal] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [expForm, setExpForm] = useState({
    company: '', title: '', start_date: '', end_date: '',
    is_current: false, description: '',
  })

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  // Save in-progress flag
  const [saving, setSaving] = useState(false)

  // Reviews and recommendations
  const [reviews, setReviews] = useState([])
  const [recommendations, setRecommendations] = useState([])

  // Resume upload
  const [uploadingResume, setUploadingResume] = useState(false)

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password change
  const [changingPassword, setChangingPassword] = useState(false)

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // ─── Data fetching ───────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch {
      // silently fail — component will render nothing
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewsAndRecs = async () => {
    if (!user) return
    try {
      const [reviewsRes, recsRes] = await Promise.all([
        fetch(`/api/reviews/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/recommendations/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (reviewsRes.ok) setReviews(await reviewsRes.json())
      if (recsRes.ok) setRecommendations(await recsRes.json())
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchReviewsAndRecs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Profile field update ────────────────────────────────────

  const updateProfile = async (fields) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        toast.success('Profile updated')
        fetchProfile()
        setEditField(null)
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  // ─── Skills CRUD ─────────────────────────────────────────────

  const addSkill = async (skill) => {
    try {
      const res = await fetch('/api/profile/me/skills', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ skill }),
      })
      if (res.ok) {
        setProfile((prev) => ({ ...prev, skills: [...(prev.skills || []), skill] }))
      }
    } catch {
      toast.error('Failed to add skill')
    }
  }

  const removeSkill = async (skill) => {
    try {
      await fetch(`/api/profile/me/skills/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile((prev) => ({
        ...prev,
        skills: (prev.skills || []).filter((s) => s !== skill),
      }))
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  // ─── Experience CRUD ─────────────────────────────────────────

  const openAddExperience = () => {
    setEditingExp(null)
    setExpForm({
      company: '', title: '', start_date: '', end_date: '',
      is_current: false, description: '',
    })
    setShowExpModal(true)
  }

  const openEditExperience = (exp) => {
    setEditingExp(exp)
    setExpForm({
      company: exp.company || '',
      title: exp.title || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: !!exp.is_current,
      description: exp.description || '',
    })
    setShowExpModal(true)
  }

  const saveExperience = async () => {
    setSaving(true)
    try {
      const url = editingExp
        ? `/api/profile/me/experience/${editingExp.id}`
        : '/api/profile/me/experience'
      const method = editingExp ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(expForm),
      })
      if (res.ok) {
        toast.success(editingExp ? 'Experience updated' : 'Experience added')
        setShowExpModal(false)
        setEditingExp(null)
        fetchProfile()
      } else {
        toast.error('Failed to save experience')
      }
    } catch {
      toast.error('Failed to save experience')
    } finally {
      setSaving(false)
    }
  }

  const deleteExperience = async (id) => {
    try {
      await fetch(`/api/profile/me/experience/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Experience removed')
      setDeleteConfirm(null)
      fetchProfile()
    } catch {
      toast.error('Failed to delete experience')
    }
  }

  // ─── Notification toggle ────────────────────────────────────

  const updateNotification = async (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value ? 1 : 0 }))
    await updateProfile({ [key]: value ? 1 : 0 })
  }

  // ─── Resume upload ──────────────────────────────────────────

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch('/api/profile/me/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(prev => ({ ...prev, resume_filename: data.filename, resume_url: data.url }))
        toast.success('Resume uploaded!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingResume(false)
    }
  }

  // ─── Avatar upload ──────────────────────────────────────────

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF image')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/profile/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
        updateUser({ avatar_url: data.avatar_url })
        toast.success('Photo updated!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  // ─── Password change ────────────────────────────────────────

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('All password fields are required')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords don\'t match')
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Password updated')
        setPasswordForm({ current: '', new: '', confirm: '' })
      } else {
        toast.error(data.error || 'Failed to update password')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteResume = async () => {
    try {
      const res = await fetch('/api/profile/me/resume', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setProfile(prev => ({ ...prev, resume_filename: null, resume_url: null }))
        toast.success('Resume removed')
      }
    } catch {
      toast.error('Failed to remove resume')
    }
  }

  // ─── Loading / empty states ─────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const completion = computeCompletion(profile)

  // ─── Reusable inline-editable field ─────────────────────────

  const EditableField = ({ label, value, field, type = 'text', options }) => {
    const isEditing = editField === field

    return (
      <div className="py-3 border-b border-neutral-100 last:border-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">{label}</span>
          {!isEditing && (
            <button
              onClick={() => { setEditField(field); setEditValue(value || '') }}
              className="text-neutral-400 hover:text-brand-pink cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 flex items-center gap-2">
            {type === 'select' ? (
              <Select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                options={options}
                placeholder="Select..."
                className="flex-1"
              />
            ) : type === 'textarea' ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="flex-1"
              />
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1"
              />
            )}
            <Button size="sm" onClick={() => updateProfile({ [field]: editValue })} disabled={saving}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditField(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-dark-blue mt-1">
            {value || <span className="text-neutral-400 italic">Not set</span>}
          </p>
        )}
      </div>
    )
  }

  // ─── Tab definitions ────────────────────────────────────────

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'account', label: 'Account' },
    { id: 'billing', label: 'Billing' },
  ]

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="max-w-6xl">
      {/* ── Profile Header ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            {/* ProgressRing wraps the avatar with a completion ring */}
            <ProgressRing size={104} strokeWidth={4} progress={completion.percent}>
              <Avatar
                name={profile.name}
                src={profile.avatar_url}
                size="xl"
                pro={profile.membership_tier === 'pro'}
              />
            </ProgressRing>
            <label
              className="absolute inset-2 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              title="Upload new photo"
            >
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={20} className="text-white" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-pink text-white text-[11px] font-bold shadow-md whitespace-nowrap">
              {completion.percent}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-dark-blue">{profile.name}</h1>
                <p className="text-neutral-600">
                  {profile.title}
                  {profile.company ? ` at ${profile.company}` : ''}
                </p>
              </div>
              <Badge variant={profile.membership_tier === 'pro' ? 'pink' : 'gray'}>
                {profile.membership_tier === 'pro' ? 'Pro' : 'Free'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-500">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {profile.location}
                </span>
              )}
              {profile.industry && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} /> {profile.industry}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {profile.connections_count > 0 && (
                <Link to="/dashboard/members" className="flex items-center gap-1 text-brand-pink hover:underline">
                  <Users size={14} /> {profile.connections_count} connection{profile.connections_count !== 1 ? 's' : ''}
                </Link>
              )}
            </div>

            {/* Profile completion checklist */}
            {completion.missing.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-brand-pink/5 to-brand-blue/5 border border-brand-pink/10">
                <p className="text-xs font-semibold text-dark-blue mb-2">
                  Complete your profile ({completion.done}/{completion.total})
                </p>
                <div className="flex flex-wrap gap-2">
                  {completion.missing.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveTab(item.tab)}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-brand-pink bg-white/80 hover:bg-white px-2.5 py-1 rounded-full border border-neutral-200/60 hover:border-brand-pink/40 transition-all cursor-pointer"
                    >
                      <span className="w-1 h-1 rounded-full bg-brand-pink" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* ── ABOUT TAB ──────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="space-y-4">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-4">Personal Information</h3>

            <EditableField label="Full Name" value={profile.name} field="name" />
            <EditableField label="Job Title" value={profile.title} field="title" />
            <EditableField label="Company" value={profile.company} field="company" />
            <EditableField label="Location" value={profile.location} field="location" />
            <EditableField label="Timezone" value={profile.timezone} field="timezone" />
          </div>

          {/* About & Bio */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-4">About</h3>

            <EditableField label="Bio" value={profile.bio} field="bio" type="textarea" />
            <EditableField
              label="Industry" value={profile.industry} field="industry"
              type="select" options={INDUSTRY_OPTIONS}
            />
            <EditableField
              label="Years of Experience"
              value={profile.years_experience?.toString()}
              field="years_experience" type="number"
            />
            <EditableField label="LinkedIn" value={profile.linkedin_url} field="linkedin_url" />
            <EditableField label="Website" value={profile.website_url} field="website_url" />

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-dark-blue mb-3">Skills & Expertise</h4>
              <TagInput
                tags={profile.skills || []}
                onAdd={addSkill}
                onRemove={removeSkill}
                placeholder="Add a skill..."
                suggestions={SKILL_SUGGESTIONS}
              />
            </div>
          </div>

          {/* Ratings & Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <Star size={18} /> Ratings & Reviews
              </h3>
              <div className="space-y-3">
                {reviews.map(review => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <ThumbsUp size={18} /> Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map(rec => (
                  <RecommendationCard key={rec.id} {...rec} />
                ))}
              </div>
            </div>
          )}
          </div>
        )}

        {/* ── EXPERIENCE TAB ─────────────────────────────────── */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark-blue">Work Experience</h3>
              <Button size="sm" onClick={openAddExperience}>
                <Plus size={16} /> Add Experience
              </Button>
            </div>

            {(profile.experience || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                <GraduationCap size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No experience added yet</p>
              </div>
            ) : (
              (profile.experience || []).map((exp) => (
                <div key={exp.id} className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-dark-blue">{exp.title}</h4>
                      <p className="text-sm text-neutral-600">{exp.company}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {exp.start_date || 'Unknown'} &mdash;{' '}
                        {exp.is_current ? 'Present' : exp.end_date || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditExperience(exp)}
                        className="text-neutral-400 hover:text-brand-pink cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(exp.id)}
                        className="text-neutral-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-neutral-600 mt-3">{exp.description}</p>
                  )}
                </div>
              ))
            )}

            {/* Resume upload */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h4 className="font-semibold text-dark-blue mb-3 flex items-center gap-2">
                <FileText size={18} /> Resume / CV
              </h4>
              {profile.resume_filename ? (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <FileText size={20} className="text-brand-pink" />
                  <span className="text-sm font-medium text-dark-blue flex-1">
                    {profile.resume_filename}
                  </span>
                  <label className="cursor-pointer">
                    <Button size="sm" variant="ghost" as="span">Replace</Button>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
                  </label>
                  <Button size="sm" variant="ghost" onClick={handleDeleteResume} className="text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center">
                  <Upload size={24} className="text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 mb-3">Upload your resume (PDF, max 5MB)</p>
                  <label className="cursor-pointer inline-block">
                    <Button size="sm" variant="outline" as="span">
                      {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACCOUNT TAB ────────────────────────────────────── */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            {/* Account settings */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <Shield size={18} /> Account Settings
              </h3>

              <div className="py-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Email</span>
                <p className="text-sm font-medium text-dark-blue mt-1">{profile.email}</p>
              </div>

              <EditableField
                label="Profile Visibility"
                value={profile.profile_visibility || 'public'}
                field="profile_visibility"
                type="select"
                options={VISIBILITY_OPTIONS}
              />
            </div>

            {/* Notification preferences */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h4 className="font-semibold text-dark-blue mb-4">Notification Preferences</h4>
              <div className="space-y-4">
                <Toggle
                  label="Email notifications"
                  description="Receive email updates about activity"
                  checked={!!profile.notification_email}
                  onChange={(v) => updateNotification('notification_email', v)}
                />
                <Toggle
                  label="Message notifications"
                  description="Get notified when you receive a new message"
                  checked={!!profile.notification_messages}
                  onChange={(v) => updateNotification('notification_messages', v)}
                />
                <Toggle
                  label="Connection notifications"
                  description="Get notified about connection requests"
                  checked={!!profile.notification_connections}
                  onChange={(v) => updateNotification('notification_connections', v)}
                />
                <Toggle
                  label="Job notifications"
                  description="Get notified about job updates and new postings"
                  checked={!!profile.notification_jobs}
                  onChange={(v) => updateNotification('notification_jobs', v)}
                />
              </div>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h4 className="font-semibold text-dark-blue mb-4">Change Password</h4>
              <div className="space-y-3 max-w-md">
                <Input
                  type="password"
                  label="Current Password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                />
                <Input
                  type="password"
                  label="New Password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                />
                <Button size="sm" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Updating…' : 'Update Password'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── BILLING TAB ────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            {/* Current plan */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <CreditCard size={18} /> Current Plan
              </h3>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-pink/5 to-brand-blue/5 rounded-xl">
                <div>
                  <h4 className="text-xl font-bold text-dark-blue">
                    {profile.membership_tier === 'pro' ? 'Pro Access' : 'Free'} Plan
                  </h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    {profile.membership_tier === 'pro'
                      ? '$15 / month · Billed annually'
                      : 'Basic access with limited features'}
                  </p>
                </div>
                <Badge
                  variant={profile.membership_tier === 'pro' ? 'pink' : 'gray'}
                  className="text-base px-4 py-2"
                >
                  {profile.membership_tier === 'pro' ? 'ACTIVE' : 'FREE'}
                </Badge>
              </div>

              {profile.membership_tier === 'pro' && (
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                  <li>• Unlimited live sessions &amp; full on-demand library</li>
                  <li>• Full community access, messaging &amp; connections</li>
                  <li>• Marketplace listings &amp; job board</li>
                </ul>
              )}

              {profile.membership_tier !== 'pro' && (
                <Link to="/pricing">
                  <Button className="mt-4">Upgrade to Pro</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Experience Modal ─────────────────────────────────── */}
      <Modal
        isOpen={showExpModal}
        onClose={() => { setShowExpModal(false); setEditingExp(null) }}
        title={editingExp ? 'Edit Experience' : 'Add Experience'}
      >
        <div className="space-y-4">
          <Input
            label="Job Title *"
            value={expForm.title}
            onChange={(e) => setExpForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. VP of Marketing"
          />
          <Input
            label="Company *"
            value={expForm.company}
            onChange={(e) => setExpForm((p) => ({ ...p, company: e.target.value }))}
            placeholder="e.g. TechFlow"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="month"
              value={expForm.start_date}
              onChange={(e) => setExpForm((p) => ({ ...p, start_date: e.target.value }))}
            />
            <Input
              label="End Date"
              type="month"
              value={expForm.end_date}
              onChange={(e) => setExpForm((p) => ({ ...p, end_date: e.target.value }))}
              disabled={expForm.is_current}
            />
          </div>
          <Toggle
            label="I currently work here"
            checked={expForm.is_current}
            onChange={(v) => setExpForm((p) => ({ ...p, is_current: v, end_date: v ? '' : p.end_date }))}
          />
          <Textarea
            label="Description"
            value={expForm.description}
            onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            placeholder="Describe your role and achievements..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowExpModal(false); setEditingExp(null) }}>
              Cancel
            </Button>
            <Button
              onClick={saveExperience}
              disabled={saving || !expForm.title || !expForm.company}
            >
              {saving ? 'Saving...' : editingExp ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ──────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteExperience(deleteConfirm)}
        title="Delete Experience"
        message="Are you sure you want to remove this experience entry? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
