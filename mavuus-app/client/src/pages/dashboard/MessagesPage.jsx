import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { Search, Send, MessageCircle, ArrowLeft, Plus } from 'lucide-react'

export default function MessagesPage() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        return data
      }
    } catch {
      // silently fail on poll
    }
    return []
  }, [token])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId) => {
    try {
      const res = await fetch(`/api/messages/conversations/${convId}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        // Mark as read
        fetch(`/api/messages/conversations/${convId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
      }
    } catch {
      // silently fail on poll
    }
  }, [token])

  // Initial load
  useEffect(() => {
    const t = token || localStorage.getItem('mavuus_token')
    if (!t) {
      setLoading(false)
      return
    }
    const init = async () => {
      try {
        const res = await fetch('/api/messages/conversations', { headers: { Authorization: `Bearer ${t}` } })
        if (res.ok) {
          const convs = await res.json()
          setConversations(convs)
          // Auto-select from URL param (by conversation id)
          const convParam = searchParams.get('conversation')
          if (convParam && convs.length > 0) {
            const conv = convs.find(c => c.id === parseInt(convParam))
            if (conv) {
              setSelectedConv(conv)
              fetchMessages(conv.id)
            }
          }
          // Auto-select from URL param (by user id)
          const userParam = searchParams.get('user')
          if (userParam && convs.length > 0) {
            const conv = convs.find(c => c.other_user_id === parseInt(userParam))
            if (conv) {
              setSelectedConv(conv)
              fetchMessages(conv.id)
            }
          }
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [token])

  // Poll conversations every 10s
  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  // Poll messages every 5s when conversation is active
  useEffect(() => {
    if (!selectedConv) return
    const interval = setInterval(() => fetchMessages(selectedConv.id), 5000)
    return () => clearInterval(interval)
  }, [selectedConv, fetchMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = (conv) => {
    setSelectedConv(conv)
    fetchMessages(conv.id)
    // Update unread count in conv list
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConv || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/conversations/${selectedConv.id}/messages`, {
        method: 'POST', headers, body: JSON.stringify({ content: newMessage.trim() })
      })
      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedConv.id)
        fetchConversations()
        inputRef.current?.focus()
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatMessageTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const filteredConvs = conversations.filter(c =>
    c.other_user_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 flex h-[calc(100vh-140px)] overflow-hidden">
      {/* Left Panel - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-100 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-dark-blue">Messages</h2>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-brand-pink" />
              </div>
              <p className="text-sm font-semibold text-dark-blue mb-1">No conversations yet</p>
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                Start a conversation by visiting a member&apos;s profile and clicking the &ldquo;Message&rdquo; button.
              </p>
              <Link to="/dashboard/members" className="inline-flex items-center gap-1 text-xs font-medium text-brand-pink hover:underline">
                Browse Members <ArrowLeft size={12} className="rotate-180" />
              </Link>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
                  selectedConv?.id === conv.id ? 'bg-brand-pink/5 border-r-2 border-brand-pink' : ''
                }`}
              >
                <Avatar name={conv.other_user_name} src={conv.other_user_avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium truncate ${conv.unread_count > 0 ? 'text-dark-blue' : 'text-neutral-700'}`}>
                      {conv.other_user_name}
                    </span>
                    <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">
                      {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-dark-blue font-medium' : 'text-neutral-500'}`}>
                      {conv.last_message_sender_id === user?.id ? 'You: ' : ''}{conv.last_message || 'No messages yet'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <button onClick={() => setSelectedConv(null)} className="md:hidden text-neutral-500 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <Avatar name={selectedConv.other_user_name} src={selectedConv.other_user_avatar} size="sm" />
              <div>
                <h3 className="text-sm font-semibold text-dark-blue">{selectedConv.other_user_name}</h3>
                <p className="text-xs text-neutral-500">{selectedConv.other_user_title || 'Mavuus Member'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id
                const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString()

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full">
                          {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? 'bg-brand-pink text-white rounded-br-md'
                          : 'bg-neutral-100 text-dark-blue rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-neutral-400'}`}>
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-neutral-100 flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
              <Button type="submit" size="sm" pill disabled={!newMessage.trim() || sending}>
                <Send size={16} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title="Select a conversation"
              message="Choose a conversation from the left or start a new one from a member's profile."
            />
          </div>
        )}
      </div>
    </div>
  )
}
