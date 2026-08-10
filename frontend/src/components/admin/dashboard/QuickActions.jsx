import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  ImagePlus,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  UserPlus,
  Warehouse,
} from 'lucide-react'

const actions = [
  { label: 'Add Product', to: '/admin/products', icon: Package, tone: 'indigo' },
  { label: 'Add Category', to: '/admin/categories', icon: Tags, tone: 'cyan' },
  { label: 'Create Coupon', to: '/admin/coupons', icon: Ticket, tone: 'amber' },
  { label: 'View Orders', to: '/admin/orders', icon: ShoppingBag, tone: 'violet' },
  { label: 'Add User', to: '/admin/users', icon: UserPlus, tone: 'green' },
  { label: 'Manage Inventory', to: '/admin/inventory', icon: Warehouse, tone: 'rose' },
  { label: 'Upload Media', to: '/admin/media', icon: ImagePlus, tone: 'sky' },
  { label: 'Open Settings', to: '/admin/settings', icon: Settings, tone: 'slate' },
]

export function QuickActions() {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Quick Actions</h2>
          <p>Jump into common admin workflows</p>
        </div>
      </div>
      <div className="dash-quick-actions">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Link to={action.to} className={`dash-quick-action dash-quick-action--${action.tone}`}>
              <action.icon size={20} aria-hidden="true" />
              <span>{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function ShortcutSection({ shortcuts }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Shortcuts</h2>
          <p>Pinned modules and recent activity</p>
        </div>
      </div>
      <div className="dash-shortcuts">
        <div>
          <h3>Pinned Modules</h3>
          <ul>
            {shortcuts.pinned.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>
                  <FolderOpen size={14} /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recently Opened</h3>
          <ul>
            {shortcuts.recent.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recent Searches</h3>
          <ul>
            {shortcuts.searches.map((term) => (
              <li key={term}>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
