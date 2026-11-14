import { useState } from 'react'
import { Facebook, Linkedin, MessageCircle, Send, Twitter } from 'lucide-react'
import { Button, Input } from '../../primitives'
import { Dialog } from '../Dialog'
import { FormField } from '../FormField'
import { useToast } from '../Toast'

const NETWORKS = [
  { label: 'Facebook', icon: Facebook, href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  {
    label: 'Twitter',
    icon: Twitter,
    href: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  { label: 'LinkedIn', icon: Linkedin, href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  { label: 'WhatsApp', icon: MessageCircle, href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`.trim())}` },
  {
    label: 'Telegram',
    icon: Send,
    href: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
]

/**
 * Share a page: links to the social networks, the URL with a Copy button (a toast confirms) and an
 * email invite that opens the mail app.
 * - `open` / `onOpenChange(open)`, or a `trigger`, as on Dialog. `title` names the dialog
 *   (default "Share").
 * - `url`: what to share (default the current page). `shareTitle`: the item's name, used as the
 *   post text and the email subject.
 * Needs one <Toaster /> in the app for the copy confirmation. Other props go to the Dialog.
 */
export function ShareDialog({ title = 'Share', url, shareTitle = '', onOpenChange, ...props }) {
  const toast = useToast()
  const [invite, setInvite] = useState('')
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error("Couldn't copy the link. Select it and copy it instead.")
    }
  }

  const sendInvite = (event) => {
    event.preventDefault()
    if (!invite.trim()) return
    const subject = encodeURIComponent(shareTitle || 'Check this out on Mavuus')
    const body = encodeURIComponent(`I thought you'd like this: ${shareUrl}`)
    window.location.href = `mailto:${invite.trim()}?subject=${subject}&body=${body}`
    setInvite('')
    onOpenChange?.(false)
  }

  return (
    <Dialog title={title} onOpenChange={onOpenChange} {...props}>
      <div className="flex flex-col gap-ds-lg">
        <ul aria-label="Share on" className="flex flex-wrap gap-ds-xs">
          {NETWORKS.map((network) => (
            <li key={network.label}>
              <Button
                href={network.href(shareUrl, shareTitle)}
                variant="outline"
                size="sm"
                leadingIcon={network.icon}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${network.label} (opens in a new tab)`}
              >
                {network.label}
              </Button>
            </li>
          ))}
        </ul>
        <FormField label="Or copy link">
          <Input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
            trailing={
              <Button size="sm" onClick={copy}>
                Copy
              </Button>
            }
          />
        </FormField>
        <form onSubmit={sendInvite} className="flex flex-col gap-ds-sm">
          <FormField label="Send invite to your friend">
            <Input type="email" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="friend@example.com" />
          </FormField>
          <Button type="submit" className="self-start">
            Submit
          </Button>
        </form>
      </div>
    </Dialog>
  )
}
