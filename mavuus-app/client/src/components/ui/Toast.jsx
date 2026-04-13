import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-brand-blue" />,
}

const bgColors = {
  success: 'bg-white/90 backdrop-blur-md border-l-4 border-green-500 border border-neutral-100',
  error: 'bg-white/90 backdrop-blur-md border-l-4 border-red-500 border border-neutral-100',
  info: 'bg-white/90 backdrop-blur-md border-l-4 border-brand-blue border border-neutral-100',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useMemo(() => ({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }), [addToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] animate-slide-in-right ${bgColors[t.type]}`}
          >
            {icons[t.type]}
            <span className="text-sm text-dark-blue flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-neutral-400 hover:text-dark-blue cursor-pointer">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
