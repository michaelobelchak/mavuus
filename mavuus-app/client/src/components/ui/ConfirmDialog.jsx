import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'primary', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-neutral-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Loading...' : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
