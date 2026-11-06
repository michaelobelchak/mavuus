import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { DEFAULT_MEDIA_RATIO, MEDIA_RATIOS, mediaRatios } from './mediaFrameOptions'

/**
 * Image frame for cards and sections: card radius, fixed aspect ratio, tinted while loading.
 * - `ratio`: 3/2 (default), 16/9, 4/3, 1/1 or 4/5.
 * - `alt`: empty by default (decorative). Pass real alt text when the image carries meaning.
 * - `eager`: load right away (above the fold). Otherwise lazy.
 * - The image zooms slowly when a parent with the `group` class is hovered or focused
 *   (no zoom with reduced motion). `children` render on top of the image (badges, overlays).
 */
export function MediaFrame({ src, srcSet, sizes, alt = '', ratio, eager = false, className, children, ref, ...props }) {
  const resolvedRatio = resolveOption(ratio, MEDIA_RATIOS, DEFAULT_MEDIA_RATIO, 'MediaFrame', 'ratio')
  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden rounded-card bg-surface-sunken', mediaRatios[resolvedRatio], className)}
      {...props}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'size-full object-cover transition-transform duration-500 ease-enter',
          'group-hover:scale-105 group-focus-visible:scale-105',
          'motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100',
        )}
      />
      {children}
    </div>
  )
}
