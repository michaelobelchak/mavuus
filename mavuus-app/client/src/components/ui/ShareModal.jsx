import { useEffect, useState } from 'react'
import { useToast } from './Toast'
import { X, Facebook, Twitter, Linkedin, Send, MessageCircle } from 'lucide-react'

const socialButtons = [
  {
    label: 'Facebook',
    icon: Facebook,
    bg: 'bg-[#1877F2]',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: 'Twitter',
    icon: Twitter,
    bg: 'bg-black',
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`,
  },
  {
    label: 'LinkedIn',
    icon: Linkedin,
    bg: 'bg-[#0A66C2]',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    bg: 'bg-[#25D366]',
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title || ''} ${url}`)}`,
  },
  {
    label: 'Telegram',
    icon: Send,
    bg: 'bg-[#2AABEE]',
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`,
  },
]

export default function ShareModal({ open, onClose, title = 'Share', url, shareTitle = '' }) {
  const toast = useToast()
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const [invite, setInvite] = useState('')

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  const handleSendInvite = (e) => {
    e.preventDefault()
    if (!invite.trim()) return
    const subject = encodeURIComponent(shareTitle || 'Check this out on Mavuus')
    const body = encodeURIComponent(`I thought you'd like this: ${shareUrl}`)
    window.location.href = `mailto:${invite}?subject=${subject}&body=${body}`
    setInvite('')
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-dark-blue transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <h3 className="text-[20px] md:text-[22px] font-semibold text-dark-blue mb-6 pr-10">
          {title}
        </h3>

        {/* Social buttons */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {socialButtons.map(({ label, icon: Icon, bg, href }) => (
            <a
              key={label}
              href={href(shareUrl, shareTitle)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full ${bg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 group-hover:text-dark-blue transition-colors">
                {label}
              </span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div className="mb-5">
          <label className="text-[13px] font-semibold text-neutral-600 block mb-2">
            Or copy link
          </label>
          <div className="flex items-center gap-2 p-1 border border-neutral-200 rounded-full bg-white">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-neutral-600 px-4 outline-none truncate"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2 rounded-full bg-brand-pink text-white text-sm font-semibold hover:bg-brand-pink-hover transition-colors cursor-pointer shrink-0"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Send to email */}
        <form onSubmit={handleSendInvite}>
          <label className="text-[13px] font-semibold text-neutral-600 block mb-2">
            Send invite to your friend
          </label>
          <div className="flex items-center gap-2 p-1 border border-neutral-200 rounded-full bg-white">
            <input
              type="email"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 bg-transparent text-sm text-neutral-600 px-4 py-2 outline-none placeholder:text-neutral-300"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-brand-pink text-white text-sm font-semibold hover:bg-brand-pink-hover transition-colors cursor-pointer shrink-0"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
