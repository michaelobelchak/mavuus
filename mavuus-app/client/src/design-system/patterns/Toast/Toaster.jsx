import { useSyncExternalStore } from 'react'
import { Toaster as SonnerToaster } from 'sonner'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Icon } from '../../primitives'

// Below Tailwind's sm breakpoint toasts drop in from the top center, away from the mobile nav.
const SMALL_SCREEN = '(max-width: 639px)'

function smallScreenQuery() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  return window.matchMedia(SMALL_SCREEN)
}

function subscribe(onChange) {
  const media = smallScreenQuery()
  if (!media) return () => {}
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const isSmallScreen = () => Boolean(smallScreenQuery()?.matches)

// Sonner reads its colors from these variables. Inline styles beat its built-in light theme.
const themeVariables = {
  zIndex: 'var(--ds-z-toast)',
  '--border-radius': 'var(--ds-radius-lg)',
  '--normal-bg': 'var(--surface-overlay)',
  '--normal-border': 'var(--border-default)',
  '--normal-text': 'var(--text-primary)',
  '--success-bg': 'var(--status-success-subtle)',
  '--success-border': 'var(--status-success)',
  '--success-text': 'var(--text-primary)',
  '--info-bg': 'var(--status-info-subtle)',
  '--info-border': 'var(--status-info)',
  '--info-text': 'var(--text-primary)',
  '--warning-bg': 'var(--status-warning-subtle)',
  '--warning-border': 'var(--status-warning)',
  '--warning-text': 'var(--text-primary)',
  '--error-bg': 'var(--status-error-subtle)',
  '--error-border': 'var(--status-error)',
  '--error-text': 'var(--text-primary)',
}

// Same icons as Alert, so a status always has a shape and not only a color.
const icons = {
  success: <Icon icon={CheckCircle2} size="md" className="text-status-success" />,
  info: <Icon icon={Info} size="md" className="text-status-info" />,
  warning: <Icon icon={AlertTriangle} size="md" className="text-status-warning" />,
  error: <Icon icon={XCircle} size="md" className="text-status-error" />,
  close: <Icon icon={X} size="sm" />,
}

/**
 * Mount once near the app root, then call `toast.success(...)` or `useToast()` anywhere. Built on
 * sonner and themed with our role tokens: status toasts use the subtle status backgrounds with
 * the Alert icons, and every toast has a close button labelled "Dismiss". Toasts sit bottom right,
 * or top center below 640px; pass `position` to pin one place. Sonner announces toasts in a
 * polite live region and turns its slide and stack motion off under prefers-reduced-motion.
 * Other props go to sonner's Toaster.
 */
export function Toaster({ position, style, toastOptions, ...props }) {
  const small = useSyncExternalStore(subscribe, isSmallScreen, () => false)
  return (
    <SonnerToaster
      position={position ?? (small ? 'top-center' : 'bottom-right')}
      richColors
      closeButton
      icons={icons}
      style={{ ...themeVariables, ...style }}
      toastOptions={{
        closeButtonAriaLabel: 'Dismiss',
        ...toastOptions,
        classNames: {
          toast: 'font-sans text-body-sm shadow-overlay!',
          title: 'font-semibold',
          description: 'text-text-secondary!',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}
