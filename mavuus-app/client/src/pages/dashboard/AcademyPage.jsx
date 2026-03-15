import { useState } from 'react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { liveSessions, onDemandVideos, communityResources, speakers } from '../../data/mockData'
import { Calendar, Clock, PlayCircle, FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const tabs = ['All', 'Live Sessions', 'On-Demand', 'Resources']

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('All')
  const { user } = useAuth()

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveSessions.map(session => (
              <Card key={session.id} hover>
                <div className="h-36 bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 rounded-xl mb-4 flex items-center justify-center">
                  <Calendar size={32} className="text-brand-blue/40" />
                </div>
                <Badge variant="blue">{session.category}</Badge>
                <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{session.title}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                  <Calendar size={12} />
                  <span>{new Date(session.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <Clock size={12} className="ml-2" />
                  <span>{session.duration}</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  <Avatar name={session.speaker_name} size="sm" />
                  <div>
                    <p className="text-xs font-medium text-dark-blue">{session.speaker_name}</p>
                    <p className="text-[11px] text-neutral-500">{session.speaker_title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {onDemandVideos.map(video => (
              <Card key={video.id} hover>
                <div className="h-36 bg-gradient-to-br from-brand-pink/10 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                  <PlayCircle size={32} className="text-brand-pink/40" />
                </div>
                <Badge>{video.category}</Badge>
                <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{video.title}</h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} />{video.duration}</span>
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  <Avatar name={video.speaker_name} size="sm" />
                  <p className="text-xs font-medium text-dark-blue">{video.speaker_name}</p>
                </div>
              </Card>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityResources.map(resource => (
              <Card key={resource.id} hover>
                <div className="h-36 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center">
                  <FileText size={32} className="text-brand-blue/40" />
                </div>
                <Badge variant="gray">{resource.category}</Badge>
                <h3 className="text-base font-semibold text-dark-blue mt-3 mb-2">{resource.title}</h3>
                <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{resource.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                  <span>{resource.author}</span>
                  <span>{resource.read_time}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Past Speakers */}
      {activeTab === 'All' && (
        <section>
          <h2 className="text-lg font-semibold text-dark-blue mb-5">Past Speakers</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {speakers.map(speaker => (
              <div key={speaker.id} className="flex-shrink-0 text-center">
                <Avatar name={speaker.name} size="xl" className="mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-blue">{speaker.name}</p>
                <p className="text-xs text-neutral-500">{speaker.title}</p>
                <p className="text-xs text-brand-pink">{speaker.company}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
