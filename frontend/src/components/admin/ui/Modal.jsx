import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, footer = null, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <div className="admin-v2-modal-root" role="presentation">
          <motion.button
            type="button"
            className="admin-v2-modal-backdrop"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`admin-v2-modal admin-v2-modal--${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-v2-modal-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <header className="admin-v2-modal__header">
              <h2 id="admin-v2-modal-title" className="admin-v2-modal__title">
                {title}
              </h2>
              <button type="button" className="admin-v2-icon-btn" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="admin-v2-modal__body">{children}</div>
            {footer ? <footer className="admin-v2-modal__footer">{footer}</footer> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="admin-v2-btn admin-v2-btn--ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-v2-btn admin-v2-btn--${tone === 'danger' ? 'danger' : 'primary'}`}
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="admin-v2-modal__message">{message}</p>
    </Modal>
  )
}
