import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-modal-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-scale-in`}>
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            {title && <h2 className="text-lg font-semibold text-dark-blue">{title}</h2>}
            {showClose && (
              <button onClick={onClose} className="text-neutral-400 hover:text-dark-blue transition-colors cursor-pointer ml-auto">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
