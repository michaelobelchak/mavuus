import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  MapPin,
  Briefcase,
  Calendar,
  MessageCircle,
  UserPlus,
  UserCheck,
  Users,
  Clock,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'

export default function MemberProfilePage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState({ status: 'none' })
  const [connecting, setConnecting] = useState(false)

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Redirect to own profile
  useEffect(() => {
    if (user && parseInt(id) === user.id) {
      navigate('/dashboard/profile', { replace: true })
    }
  }, [id, user, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, connRes] = await Promise.all([
          fetch(`/api/members/${id}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/connections/status/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (memberRes.ok) setMember(await memberRes.json())
        if (connRes.ok) setConnectionStatus(await connRes.json())
      } catch {
        // Network error — keep defaults
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, token])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: parseInt(id) }),
      })
      if (res.ok) {
        setConnectionStatus({ status: 'pending', direction: 'outgoing' })
        toast.success('Connection request sent!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send request')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setConnecting(false)
    }
  }

  const handleAccept = async () => {
    try {
      const res = await fetch(
        `/api/connections/${connectionStatus.id}/accept`,
        { method: 'PUT', headers }
      )
      if (res.ok) {
        setConnectionStatus({ ...connectionStatus, status: 'accepted' })
        toast.success('Connection accepted!')
      }
    } catch {
      toast.error('Failed to accept connection')
    }
  }

  const handleMessage = () => {
    navigate(`/dashboard/messages?user=${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Member not found</p>
        <Link
          to="/dashboard/members"
          className="text-brand-pink hover:underline mt-2 inline-block"
        >
          Back to Members
        </Link>
      </div>
    )
  }

  const ConnectButton = () => {
    if (connectionStatus.status === 'accepted') {
      return (
        <Button variant="outline" size="sm" disabled>
          <UserCheck size={16} /> Connected
        </Button>
      )
    }
    if (
      connectionStatus.status === 'pending' &&
      connectionStatus.direction === 'outgoing'
    ) {
      return (
        <Button variant="outline" size="sm" disabled>
          <Clock size={16} /> Request Sent
        </Button>
      )
    }
    if (
      connectionStatus.status === 'pending' &&
      connectionStatus.direction === 'incoming'
    ) {
      return (
        <Button size="sm" onClick={handleAccept}>
          <UserPlus size={16} /> Accept Request
        </Button>
      )
    }
    return (
      <Button size="sm" onClick={handleConnect} disabled={connecting}>
        <UserPlus size={16} /> {connecting ? 'Sending...' : 'Connect'}
      </Button>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar
            name={member.name}
            src={member.avatar_url}
            size="xl"
          />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-dark-blue">
                  {member.name}
                </h1>
                <p className="text-neutral-600">
                  {member.title}
                  {member.company ? ` at ${member.company}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ConnectButton />
                {connectionStatus.status === 'accepted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMessage}
                  >
                    <MessageCircle size={16} /> Message
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-500">
              {member.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {member.location}
                </span>
              )}
              {member.industry && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {member.industry}
                </span>
              )}
              {member.years_experience && (
                <span className="flex items-center gap-1">
                  {member.years_experience}+ years experience
                </span>
              )}
              {member.connection_count > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {member.connection_count} connection{member.connection_count !== 1 ? 's' : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Member since{' '}
                {new Date(member.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mt-2"
              >
                <ExternalLink size={14} /> LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-dark-blue mb-3">About</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {member.bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {member.skills && member.skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-dark-blue mb-3">
            Skills & Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill) => (
              <Badge key={skill} variant="blue">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {member.experience && member.experience.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-dark-blue mb-4">
            Experience
          </h3>
          <div className="space-y-4">
            {member.experience.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark-blue">{exp.title}</h4>
                  <p className="text-sm text-neutral-600">{exp.company}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {exp.start_date || 'Unknown'} —{' '}
                    {exp.is_current
                      ? 'Present'
                      : exp.end_date || 'Unknown'}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-neutral-600 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
