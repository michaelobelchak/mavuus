import { useState } from 'react'
import { Banner } from '@/design-system/patterns'
import { Button } from '@/design-system/primitives'

const DESCRIPTIONS = {
  idle: 'Check your inbox for the verification link.',
  sent: 'We sent a new link. Check your inbox.',
  failed: "Couldn't resend the verification email. Try again.",
}

/** Asks an unverified member to verify their email, with a Resend button. */
export function EmailVerificationBanner({ token, className }) {
  const [status, setStatus] = useState('idle')

  async function resend() {
    setStatus('sending')
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      setStatus(response.ok ? 'sent' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <Banner
      tone={status === 'failed' ? 'error' : 'warning'}
      title="Please verify your email"
      description={DESCRIPTIONS[status] ?? DESCRIPTIONS.idle}
      className={className}
      actions={
        <Button size="sm" variant="outline" loading={status === 'sending'} onClick={resend}>
          Resend
        </Button>
      }
    />
  )
}
