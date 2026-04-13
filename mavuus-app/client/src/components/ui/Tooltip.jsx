import { useState, useRef } from 'react'

export default function Tooltip({ content, children, position = 'top', className = '' }) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const show = () => {
    timerRef.current = setTimeout(() => setOpen(true), 200)
  }
  const hide = () => {
    clearTimeout(timerRef.current)
    setOpen(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`
            pointer-events-none absolute z-50 whitespace-nowrap
            px-2.5 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium shadow-lg
            ${positionClasses[position]}
          `}
        >
          {content}
        </span>
      )}
    </span>
  )
}
