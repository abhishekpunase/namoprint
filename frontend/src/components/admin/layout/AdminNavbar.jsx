import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle,
  HelpCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAdminPageMeta } from '../../../config/adminNavigation'
import { ADMIN_BRAND_NAME } from '../../../config/adminBrand'
import { useAuth } from '../../../hooks/useAuth'
import { useAdminTheme } from '../../../hooks/useAdminTheme'
import { EmptyState } from '../ui/EmptyState'
import { NotificationBell } from '../notifications/NotificationBell'
import { useGlobalSearchContext } from '../global/CommandPalette'

function DropdownPanel({ children, className = '' }) {
  return (
    <motion.div
      className={`admin-v2-dropdown ${className}`.trim()}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  )
}

function useDismissOnOutside(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onClose, ref])
}

export function AdminNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme, toggleMobileSidebar, isDrawer, isMobile } = useAdminTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const profileRef = useRef(null)
  const messagesRef = useRef(null)

  const pageMeta = getAdminPageMeta(location.pathname)
  const globalSearch = useGlobalSearchContext()

  useDismissOnOutside(profileRef, profileOpen, () => setProfileOpen(false))
  useDismissOnOutside(messagesRef, messagesOpen, () => setMessagesOpen(false))

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/admin/login')
  }

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="admin-v2-navbar">
      <div className="admin-v2-navbar__left">
        {isDrawer ? (
          <button
            type="button"
            className="admin-v2-icon-btn"
            aria-label="Open navigation menu"
            onClick={toggleMobileSidebar}
          >
            <Menu size={20} />
          </button>
        ) : null}

        <Link to="/admin" className="admin-v2-navbar__logo" aria-label={`${ADMIN_BRAND_NAME} Admin home`}>
          <span className="admin-v2-brand__mark">N</span>
          {isMobile ? null : <strong>{ADMIN_BRAND_NAME}</strong>}
        </Link>

        <div className="admin-v2-navbar__title-block">
          <h1 className="admin-v2-navbar__title">{pageMeta.title}</h1>
          {pageMeta.description ? (
            <p className="admin-v2-navbar__subtitle">{pageMeta.description}</p>
          ) : null}
        </div>
      </div>

      <div className="admin-v2-navbar__center">
        <button
          type="button"
          className="admin-v2-search-trigger"
          onClick={() => globalSearch.openPalette()}
          aria-label="Open global search (Ctrl+K)"
        >
          <Search size={17} strokeWidth={2.25} />
          <span className="admin-v2-search-trigger__label">Search everything…</span>
          <kbd className="admin-v2-search-trigger__kbd">Ctrl K</kbd>
        </button>
      </div>

      <div className="admin-v2-navbar__actions">
        <button
          type="button"
          className="admin-v2-icon-btn admin-v2-icon-btn--search-mobile"
          onClick={() => globalSearch.openPalette()}
          aria-label="Open global search"
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          className="admin-v2-icon-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell
          onOpenChange={(open) => {
            if (open) {
              setMessagesOpen(false)
              setProfileOpen(false)
            }
          }}
        />

        <div className="admin-v2-navbar__menu" ref={messagesRef}>
          <button
            type="button"
            className="admin-v2-icon-btn"
            aria-label="Messages"
            aria-expanded={messagesOpen}
            onClick={() => {
              setMessagesOpen((current) => !current)
              setProfileOpen(false)
            }}
          >
            <MessageSquare size={18} />
          </button>
          <AnimatePresence>
            {messagesOpen ? (
              <DropdownPanel className="admin-v2-dropdown--panel">
                <p className="admin-v2-dropdown__heading">Messages</p>
                <EmptyState
                  title="No messages"
                  description="Customer messages will appear here when available."
                />
              </DropdownPanel>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="admin-v2-navbar__menu" ref={profileRef}>
          <button
            type="button"
            className="admin-v2-profile-trigger"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((current) => !current)
              setMessagesOpen(false)
            }}
          >
            <span className="admin-v2-profile-trigger__avatar" aria-hidden="true">
              {initials}
            </span>
            {!isMobile ? (
              <span className="admin-v2-profile-trigger__meta">
                <strong>{user?.name || 'Admin'}</strong>
                <small>{user?.email}</small>
              </span>
            ) : null}
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          <AnimatePresence>
            {profileOpen ? (
              <DropdownPanel className="admin-v2-dropdown--menu">
                <div className="admin-v2-dropdown__profile">
                  <span className="admin-v2-profile-trigger__avatar admin-v2-profile-trigger__avatar--lg">
                    {initials}
                  </span>
                  <div>
                    <strong>{user?.name || 'Admin'}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>
                <Link
                  to="/admin/profile"
                  className="admin-v2-dropdown__item"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserCircle size={18} /> My Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="admin-v2-dropdown__item"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={18} /> Settings
                </Link>
                <button
                  type="button"
                  className="admin-v2-dropdown__item"
                  onClick={() => {
                    setProfileOpen(false)
                    globalSearch.setHelpOpen(true)
                  }}
                >
                  <HelpCircle size={18} /> Help Center
                </button>
                <button
                  type="button"
                  className="admin-v2-dropdown__item"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/admin/settings')
                  }}
                >
                  <KeyRound size={18} /> Change Password
                </button>
                <button type="button" className="admin-v2-dropdown__item is-danger" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </DropdownPanel>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
