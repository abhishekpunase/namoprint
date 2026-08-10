import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  adminFooterNavigation,
  adminNavigation,
  isNavGroupActive,
  isNavItemActive,
} from '../../../config/adminNavigation'
import { useAuth } from '../../../hooks/useAuth'
import { useAdminTheme } from '../../../hooks/useAdminTheme'
import { ADMIN_BRAND_NAME, ADMIN_BRAND_TAGLINE } from '../../../config/adminBrand'

function NavItem({ item, collapsed, onNavigate }) {
  const location = useLocation()
  const active = isNavItemActive(item, location.pathname, item.end)

  if (item.action === 'logout') return null

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={`admin-v2-nav-item ${active ? 'is-active' : ''}`}
      onClick={onNavigate}
    >
      {item.icon ? <item.icon size={20} aria-hidden="true" /> : null}
      {!collapsed ? <span>{item.label}</span> : null}
      {!collapsed && item.placeholder ? <span className="admin-v2-nav-soon">Soon</span> : null}
    </NavLink>
  )
}

function NavGroup({ item, collapsed, onNavigate }) {
  const location = useLocation()
  const groupActive = isNavGroupActive(item, location.pathname)
  const [open, setOpen] = useState(groupActive)

  useEffect(() => {
    if (groupActive) setOpen(true)
  }, [groupActive])

  if (collapsed) {
    return (
      <div className="admin-v2-nav-group admin-v2-nav-group--collapsed">
        <NavLink
          to={item.children[0].to}
          title={item.label}
          className={`admin-v2-nav-item ${groupActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <item.icon size={20} aria-hidden="true" />
        </NavLink>
      </div>
    )
  }

  return (
    <div className={`admin-v2-nav-group ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`admin-v2-nav-item admin-v2-nav-item--group ${groupActive ? 'is-active' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <item.icon size={20} aria-hidden="true" />
        <span>{item.label}</span>
        <ChevronDown size={16} className="admin-v2-nav-chevron" aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="admin-v2-nav-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child) => (
              <NavLink
                key={child.id}
                to={child.to}
                className={`admin-v2-nav-child ${isNavItemActive(child, location.pathname) ? 'is-active' : ''}`}
                onClick={onNavigate}
              >
                {child.label}
              </NavLink>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SidebarInner({ collapsed, onNavigate }) {
  const { toggleSidebarCollapsed, isDrawer } = useAdminTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
    onNavigate?.()
  }

  return (
    <>
      <div className="admin-v2-sidebar__brand">
        <NavLink to="/admin" className="admin-v2-brand" onClick={onNavigate}>
          <span className="admin-v2-brand__mark">N</span>
          {!collapsed ? (
            <span className="admin-v2-brand__copy">
              <strong>{ADMIN_BRAND_NAME}</strong>
              <small>{ADMIN_BRAND_TAGLINE}</small>
            </span>
          ) : null}
        </NavLink>
        {!isDrawer ? (
          <button
            type="button"
            className="admin-v2-icon-btn admin-v2-sidebar__collapse"
            onClick={toggleSidebarCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        ) : null}
      </div>

      <nav className="admin-v2-sidebar__nav" aria-label="Admin navigation">
        {adminNavigation.map((item) =>
          item.children ? (
            <NavGroup key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ) : (
            <NavItem key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ),
        )}
      </nav>

      <div className="admin-v2-sidebar__footer">
        <NavLink to="/" className="admin-v2-sidebar__store" onClick={onNavigate}>
          <ExternalLink size={18} aria-hidden="true" />
          {!collapsed ? <span>View storefront</span> : null}
        </NavLink>

        {adminFooterNavigation.map((item) =>
          item.action === 'logout' ? (
            <button
              key={item.id}
              type="button"
              className="admin-v2-nav-item admin-v2-nav-item--logout"
              title={collapsed ? item.label : undefined}
              onClick={handleLogout}
            >
              <item.icon size={20} aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : null}
            </button>
          ) : (
            <NavItem key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ),
        )}
      </div>
    </>
  )
}

export function AdminSidebar() {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar, isDrawer } = useAdminTheme()
  const collapsed = !isDrawer && sidebarCollapsed

  const sidebarClass = [
    'admin-v2-sidebar',
    collapsed ? 'is-collapsed' : '',
    isDrawer ? 'is-mobile' : '',
    mobileSidebarOpen ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (isDrawer) {
    return (
      <>
        <AnimatePresence>
          {mobileSidebarOpen ? (
            <motion.button
              type="button"
              className="admin-v2-sidebar-overlay"
              aria-label="Close navigation menu"
              onClick={closeMobileSidebar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>
        <motion.aside
          className={sidebarClass}
          initial={false}
          animate={{ x: mobileSidebarOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        >
          <SidebarInner collapsed={false} onNavigate={closeMobileSidebar} />
        </motion.aside>
      </>
    )
  }

  return (
    <motion.aside
      className={sidebarClass}
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <SidebarInner collapsed={collapsed} />
    </motion.aside>
  )
}
