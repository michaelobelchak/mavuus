import { useState } from 'react'
import { cn } from '../../lib/cn'
import { avatarVariants } from './avatarVariants'
import { initialsOf } from './avatarUtils'

/**
 * Round profile picture. Shows initials when there's no `src` or the image fails to load.
 * Without a `name` the fallback is decorative (aria-hidden).
 */
export function Avatar({ src, name = '', size, onError, className, ref, ...props }) {
  // Remember which src failed so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  if (showImage) {
    return (
      <img
        ref={ref}
        src={src}
        alt={name}
        onError={(event) => {
          onError?.(event)
          setFailedSrc(src)
        }}
        className={cn(avatarVariants({ size }), 'object-cover', className)}
        {...props}
      />
    )
  }

  const labelProps = name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true }
  return (
    <span
      ref={ref}
      {...labelProps}
      className={cn(avatarVariants({ size }), 'bg-surface-sunken font-semibold text-text-primary', className)}
      {...props}
    >
      <span aria-hidden="true">{initialsOf(name)}</span>
    </span>
  )
}
