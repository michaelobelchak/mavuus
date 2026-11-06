import { cn } from '../../lib/cn'
import { Avatar } from './Avatar'
import { avatarVariants } from './avatarVariants'

const overlap = 'ring-2 ring-surface-raised not-first:-ml-ds-xs'

/** Overlapping row of avatars. Shows up to `max` and a "+N" chip for the rest. */
export function AvatarStack({ people = [], max = 4, size, className, ref, ...props }) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length

  return (
    <div ref={ref} className={cn('flex items-center', className)} {...props}>
      {shown.map((person, index) => (
        <Avatar
          key={person.id ?? `${person.name}-${index}`}
          src={person.src}
          name={person.name}
          size={size}
          className={overlap}
        />
      ))}
      {extra > 0 && (
        <span
          className={cn(avatarVariants({ size }), 'bg-surface-selected font-semibold text-text-brand-strong', overlap)}
        >
          <span aria-hidden="true">+{extra}</span>
          <span className="sr-only">and {extra} more</span>
        </span>
      )}
    </div>
  )
}
