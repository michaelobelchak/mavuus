import { useEffect } from 'react'
import { cn } from '../../lib/cn'
import { buttonVariants } from '../Button/buttonVariants'

const squareSize = {
  sm: 'size-9 px-ds-none',
  md: 'size-11 px-ds-none',
}

const iconSize = {
  sm: 'size-4',
  md: 'size-5',
}

/** Square icon-only button. `aria-label` is required because the icon has no visible text. */
export function IconButton({ icon: Icon, variant = 'ghost', size = 'md', type = 'button', className, ref, ...props }) {
  const label = props['aria-label']
  const labelledBy = props['aria-labelledby']

  useEffect(() => {
    if (!label && !labelledBy) {
      console.error('IconButton: pass an aria-label so screen readers can announce this button.')
    }
  }, [label, labelledBy])

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size: size === 'sm' ? 'sm' : 'md' }), squareSize[size], className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className={iconSize[size]} />}
    </button>
  )
}
