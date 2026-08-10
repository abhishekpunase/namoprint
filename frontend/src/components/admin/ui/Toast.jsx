import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const toneMap = {
  success: 'admin-v2-toast--success',
  error: 'admin-v2-toast--error',
  info: 'admin-v2-toast--info',
}

export function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="admin-v2-toast-stack" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info
          return (
            <motion.div
              key={toast.id}
              className={`admin-v2-toast ${toneMap[toast.type] || toneMap.info}`}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={18} aria-hidden="true" />
              <p>{toast.message}</p>
              <button
                type="button"
                className="admin-v2-toast__close"
                aria-label="Dismiss notification"
                onClick={() => onDismiss?.(toast.id)}
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
