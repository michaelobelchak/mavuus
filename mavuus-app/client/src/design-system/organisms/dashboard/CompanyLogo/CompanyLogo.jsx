import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveOption } from '../../../lib/resolveOption'
import { Icon } from '../../../primitives'
import { initialsOf } from '../../../primitives/Avatar/avatarUtils'

const sizes = { md: 'size-10 text-body-sm', lg: 'size-12 text-body' }
const SIZES = Object.keys(sizes)

// Two letters: the first letter of the first and last word, or the first two letters of a
// one-word name ("TechFlow" gives TE). Digits and punctuation are dropped.
function logoInitials(name = '') {
  const letters = name.replace(/[^\p{L}\s]/gu, ' ').trim()
  if (!letters) return ''
  if (/\s/.test(letters)) return initialsOf(letters)
  return Array.from(letters).slice(0, 2).join('').toUpperCase()
}

/**
 * Rounded square company or vendor logo. Shows `src`, or the company initials on a pink tint when
 * there is no image or it fails to load, or a building icon when there is no name either.
 * Decorative (aria-hidden): the company name is always shown next to it.
 * `size`: md (40px, default) or lg (48px). `className` and other props go to the root.
 */
export function CompanyLogo({ name, src, size, className, ref, ...props }) {
  const resolvedSize = resolveOption(size, SIZES, 'md', 'CompanyLogo', 'size')
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src
  const initials = logoInitials(name)
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-selected font-bold text-text-brand-strong',
        sizes[resolvedSize],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailedSrc(src)} />
      ) : initials ? (
        initials
      ) : (
        <Icon icon={Building2} size="md" />
      )}
    </span>
  )
}
