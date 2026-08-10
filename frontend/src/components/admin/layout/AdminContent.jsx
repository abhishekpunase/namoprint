import { motion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

export function AdminContent() {
  const location = useLocation()

  return (
    <main className="admin-v2-content" id="admin-main-content">
      <motion.div
        key={location.pathname}
        className="admin-v2-content__inner"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
    </main>
  )
}
