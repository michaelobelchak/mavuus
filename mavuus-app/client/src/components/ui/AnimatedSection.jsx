import useScrollReveal from '../../hooks/useScrollReveal'

/**
 * AnimatedSection - Wrapper component for scroll-triggered reveal animations
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'fade-up'|'fade-down'|'fade-left'|'fade-right'|'scale-up'|'fade'} props.animation - Animation type
 * @param {number} props.delay - Delay in ms (applied via transition-delay)
 * @param {number} props.duration - Duration in ms
 * @param {string} props.className - Additional classes
 * @param {string} props.as - HTML element type. Default: 'div'
 * @param {number} props.threshold - Intersection observer threshold
 */
export default function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  as: Tag = 'div',
  threshold = 0.15,
  ...props
}) {
  const { ref, isVisible } = useScrollReveal({ threshold })

  const baseStyles = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  }

  const animations = {
    'fade-up': {
      hidden: { opacity: 0, transform: 'translateY(40px)' },
      visible: { opacity: 1, transform: 'translateY(0)' },
    },
    'fade-down': {
      hidden: { opacity: 0, transform: 'translateY(-40px)' },
      visible: { opacity: 1, transform: 'translateY(0)' },
    },
    'fade-left': {
      hidden: { opacity: 0, transform: 'translateX(-40px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'fade-right': {
      hidden: { opacity: 0, transform: 'translateX(40px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'scale-up': {
      hidden: { opacity: 0, transform: 'scale(0.92)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  }

  const anim = animations[animation] || animations['fade-up']
  const currentState = isVisible ? anim.visible : anim.hidden

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...baseStyles, ...currentState }}
      {...props}
    >
      {children}
    </Tag>
  )
}
