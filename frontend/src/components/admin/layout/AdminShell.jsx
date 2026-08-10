import { AdminThemeProvider } from '../../../context/AdminThemeContext'
import { AdminToastProvider } from '../../../context/AdminToastContext'
import { GlobalSearchProvider } from '../global/CommandPalette'
import { useAdminTheme } from '../../../hooks/useAdminTheme'
import { AdminSeo } from '../../seo/AdminSeo'
import { AdminContent } from './AdminContent'
import { AdminNavbar } from './AdminNavbar'
import { AdminSidebar } from './AdminSidebar'

function AdminShellInner() {
  const { theme } = useAdminTheme()

  return (
    <div className="admin-v2-shell" data-admin-theme={theme}>
      <AdminSeo />
      <a href="#admin-main-content" className="ent-skip-link">Skip to main content</a>
      <AdminSidebar />
      <div className="admin-v2-shell__main">
        <AdminNavbar />
        <AdminContent />
      </div>
    </div>
  )
}

export function AdminShell() {
  return (
    <AdminThemeProvider>
      <AdminToastProvider>
        <GlobalSearchProvider>
          <AdminShellInner />
        </GlobalSearchProvider>
      </AdminToastProvider>
    </AdminThemeProvider>
  )
}
