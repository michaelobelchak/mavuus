// Image frame for cards: 16px radius, fixed aspect ratio, slow zoom when the parent `group` is hovered or focused.
export default function MediaFrame({ src, srcSet, sizes, alt = '', ratio = 'aspect-[3/2]', eager = false, className = '', children }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-live-blue-light ${ratio} ${className}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="size-full object-cover transition-transform duration-500 ease-[var(--ease-live)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      {children}
    </div>
  )
}
