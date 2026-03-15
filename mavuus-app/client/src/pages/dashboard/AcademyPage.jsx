import { useState } from 'react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import useApiData from '../../hooks/useApiData'
import { liveSessions as fallbackLive, onDemandVideos as fallbackVideos, communityResources as fallbackResources, speakers } from '../../data/mockData'
import { Calendar, Clock, PlayCircle, FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const tabs = ['All', 'Live Sessions', 'On-Demand', 'Resources']

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('All')
  const { user } = useAuth()

  const { data: sessionsRaw, loading: loadingSessions } = useApiData('/api/sessions', [])
  const { data: resourcesRaw, loading: loadingResources } = useApiData('/api/resources', [])

  // Handle both paginated { data: [...] } and plain array responses
  const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw?.data || [])
  const resources = Array.isArray(resourcesRaw) ? resourcesRaw : (resourcesRaw?.data || [])

  const liveSessions = sessions.filter(s => s.type === 'live').slice(0, 4)
  const onDemandVideos = sessions.filter(s => s.type === 'on-demand').slice(0, 4)
  const communityResources = resources.slice(0, 4)

  // Use fallbacks if API returns empty
  const displayLive = liveSessions.length > 0 ? liveSessions : fallbackLive
  const displayVideos = onDemandVideos.length > 0 ? onDemandVideos : fallbackVideos
  const displayResources = communityResources.length > 0 ? communityResources : fallbackResources

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-1">Academy</h1>
        <p className="text-neutral-500">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Here&apos;s what&apos;s happening in the community.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-brand-pink text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Upcoming Live Sessions */}
      {(activeTab === 'All' || activeTab === 'Live Sessions') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-blue">Upcoming Live Sessions</h2>
            <Link to="/dashboard/live-sessions" className="text-sm text-brand-pink hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {displayLive.map(session => (
                <Link key={session.id} to={`/dashboard/live-sessions/${session.id}`}>
                  <Card hover className="h-full">
                    <div className="h-36 rounded-xl mb-4 overflow-hidden">
                      {session.thumbnail_url ? (
                        <img src={session.thumbnail_url} alt={session.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 flex items-center justify-center">
                          <Calendar size={32} className="text-brand-blue/40" />
                        </div>
                      )}
                    </div>
                    <Badge variant="blue">{session.category}</Badge>
                    <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{session.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <Calendar size={12} />
                      <span>{session.scheduled_date ? new Date(session.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                      <Clock size={12} className="ml-2" />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                      <Avatar name={session.speaker_name} src={session.speaker_avatar} size="sm" />
                      <div>
                        <p className="text-xs font-medium text-dark-blue">{session.speaker_name}</p>
                        <p className="text-[11px] text-neutral-500">{session.speaker_title}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* On-Demand Videos */}
      {(activeTab === 'All' || activeTab === 'On-Demand') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-blue">On-Demand Videos</h2>
            <Link to="/dashboard/on-demand" className="text-sm text-brand-pink hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {displayVideos.map(video => (
                <Link key={video.id} to={`/dashboard/on-demand/${video.id}`}>
                  <Card hover className="h-full">
                    <div className="h-36 rounded-xl mb-4 overflow-hidden relative">
                      {video.thumbnail_url ? (
                        <>
                          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <PlayCircle size={40} className="text-white/80" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-pink/10 to-purple-100 flex items-center justify-center">
                          <PlayCircle size={32} className="text-brand-pink/40" />
                        </div>
                      )}
                    </div>
                    <Badge>{video.category}</Badge>
                    <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{video.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} />{video.duration}</span>
                      <span>{(video.views || 0).toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                      <Avatar name={video.speaker_name} src={video.speaker_avatar} size="sm" />
                      <p className="text-xs font-medium text-dark-blue">{video.speaker_name}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Community Resources */}
      {(activeTab === 'All' || activeTab === 'Resources') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-blue">Community Resources</h2>
            <Link to="/dashboard/resources" className="text-sm text-brand-pink hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingResources ? (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {displayResources.map(resource => (
                <Link key={resource.id} to={`/dashboard/resources/${resource.id}`}>
                  <Card hover className="h-full">
                    <div className="h-36 rounded-xl mb-4 overflow-hidden">
                      {resource.thumbnail_url ? (
                        <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                          <FileText size={32} className="text-brand-blue/40" />
                        </div>
                      )}
                    </div>
                    <Badge variant="gray">{resource.category}</Badge>
                    <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{resource.title}</h3>
                    <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      <span>{resource.author}</span>
                      <span>{resource.read_time}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Past Speakers — derived from session speakers */}
      {activeTab === 'All' && sessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-dark-blue mb-5">Past Speakers</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {sessions
              .filter(s => s.speaker_name)
              .reduce((unique, s) => {
                if (!unique.find(u => u.speaker_name === s.speaker_name)) {
                  unique.push(s)
                }
                return unique
              }, [])
              .slice(0, 8)
              .map(s => (
              <div key={s.speaker_name} className="flex-shrink-0 text-center">
                <Avatar name={s.speaker_name} src={s.speaker_avatar} size="xl" className="mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-blue">{s.speaker_name}</p>
                <p className="text-xs text-neutral-500">{s.speaker_title?.split(',')[0]}</p>
                <p className="text-xs text-brand-pink">{s.speaker_title?.split(',')[1]?.trim()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
