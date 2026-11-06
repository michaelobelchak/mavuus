// size-8 = 32px, size-10 = 40px, size-14 = 56px
export const avatarSizes = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-body-sm',
  lg: 'size-14 text-lead',
}

export function initialsOf(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}
