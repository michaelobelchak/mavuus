import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Search, Linkedin, Calendar } from 'lucide-react'

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [speakerDetail, setSpeakerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchSpeakers = useCallback(async () => {
    setLoading(true)
    try {
      const params = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''
      const res = await fetch(`/api/speakers${params}`)
      if (res.ok) setSpeakers(await res.json())
    } catch {} finally { setLoading(false) }
  }, [debouncedSearch])

  useEffect(() => { fetchSpeakers() }, [fetchSpeakers])

  const handleSpeakerClick = async (speaker) => {
    setSelectedSpeaker(speaker.id)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/speakers/${speaker.id}`)
      if (res.ok) setSpeakerDetail(await res.json())
    } catch {} finally { setDetailLoading(false) }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-dark-blue">Speakers</h1>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search speakers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Speaker Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
            </div>
          ) : speakers.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <p>No speakers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {speakers.map(speaker => (
                <button
                  key={speaker.id}
                  onClick={() => handleSpeakerClick(speaker)}
                  className={`text-left cursor-pointer transition-all ${selectedSpeaker === speaker.id ? 'ring-2 ring-brand-pink rounded-2xl' : ''}`}
                >
                  <Card hover>
                    <div className="flex flex-col items-center text-center p-2">
                      <Avatar name={speaker.name} src={speaker.avatar_url} size="xl" />
                      <h3 className="font-semibold text-dark-blue mt-3">{speaker.name}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5">{speaker.title}</p>
                      <p className="text-xs text-neutral-400">{speaker.company}</p>
                      {speaker.linkedin_url && (
                        <a
                          href={speaker.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="mt-2 text-brand-blue hover:text-brand-blue/80"
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Speaker Detail Panel */}
        {selectedSpeaker && (
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 sticky top-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
                </div>
              ) : speakerDetail ? (
                <>
                  <div className="text-center mb-4">
                    <Avatar name={speakerDetail.name} src={speakerDetail.avatar_url} size="xl" />
                    <h2 className="text-lg font-bold text-dark-blue mt-3">{speakerDetail.name}</h2>
                    <p className="text-sm text-neutral-500">{speakerDetail.title}</p>
                    <p className="text-xs text-neutral-400">{speakerDetail.company}</p>
                  </div>

                  {speakerDetail.bio && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">{speakerDetail.bio}</p>
                  )}

                  {speakerDetail.linkedin_url && (
                    <a
                      href={speakerDetail.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors mb-4"
                    >
                      <Linkedin size={14} /> LinkedIn Profile
                    </a>
                  )}

                  {speakerDetail.sessions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-dark-blue mb-3 flex items-center gap-1">
                        <Calendar size={14} /> Sessions ({speakerDetail.sessions.length})
                      </h3>
                      <div className="space-y-2">
                        {speakerDetail.sessions.map(s => (
                          <Link
                            key={s.id}
                            to={`/dashboard/${s.type === 'live' ? 'live-sessions' : 'on-demand'}/${s.id}`}
                            className="block p-3 rounded-xl border border-neutral-100 hover:border-brand-pink/30 hover:bg-brand-pink/5 transition-colors"
                          >
                            <h4 className="text-sm font-medium text-dark-blue line-clamp-2">{s.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={s.type === 'live' ? 'blue' : 'pink'} className="text-xs">{s.type}</Badge>
                              <span className="text-xs text-neutral-400">{s.duration}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
