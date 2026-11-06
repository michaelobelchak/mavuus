import { toast } from 'sonner'

export { toast }

/**
 * The toast API with the method names of the old `useToast()` (src/components/ui/Toast.jsx):
 * `success`, `error` and `info` take a message, plus `warning` and `promise` from sonner. Each also
 * takes sonner options as a second argument. Needs one <Toaster /> mounted in the app. The object
 * never changes, so it's safe in effect dependency lists. Outside React, import `toast` directly.
 */
const api = Object.freeze({
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  info: (message, options) => toast.info(message, options),
  warning: (message, options) => toast.warning(message, options),
  promise: (promise, options) => toast.promise(promise, options),
  dismiss: (id) => toast.dismiss(id),
})

export function useToast() {
  return api
}
