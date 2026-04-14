import { useState } from 'react'

export default function LazyImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  fallback = null,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return fallback || null
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`
          w-full h-full object-cover transition-all duration-500
          ${loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}
          ${imgClassName}
        `}
        {...props}
      />
    </div>
  )
}
