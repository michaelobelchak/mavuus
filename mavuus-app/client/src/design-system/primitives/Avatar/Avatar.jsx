import { useState } from 'react'
import { cn } from '../../lib/cn'
import { avatarSizes, initialsOf } from './avatarSizes'

const base = 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-chip'

/** Round profile picture. Shows initials when there's no `src` or the image fails to load. */
export function Avatar({ src, name = '', size = 'md', className, ref, ...props }) {
  // Remember which src failed so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  if (showImage) {
    return (
      <img
        ref={ref}
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        className={cn(base, 'object-cover', avatarSizes[size], className)}
        {...props}
      />
    )
  }

  return (
    <span
      ref={ref}
      role="img"
      aria-label={name || undefined}
      className={cn(base, 'bg-surface-sunken font-semibold text-text-primary', avatarSizes[size], className)}
      {...props}
    >
      <span aria-hidden="true">{initialsOf(name)}</span>
    </span>
  )
}
