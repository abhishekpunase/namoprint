import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../../hooks/useSettingsStore'
import { RoleManager, PermissionMatrix } from '../../components/admin/settings/PermissionMatrix'
import { SettingsAlert } from '../../components/admin/settings/SettingsForm'

export function AdminRolesPage() {
  const store = useSettingsStore()
  const [activeRole, setActiveRole] = useState('administrator')

  return (
    <div className="set-page">
      <header className="set-page-header">
        <div>
          <nav className="set-breadcrumb"><Link to="/admin">Admin</Link> / <span>Roles & Permissions</span></nav>
          <h1>Roles & Permissions</h1>
          <p>Plan access control with a permission matrix. Backend currently supports <code>customer</code> and <code>admin</code> only.</p>
        </div>
      </header>

      <SettingsAlert type="info">
        Role changes do not modify authentication. Existing JWT + <code>authorize('admin')</code> middleware is unchanged.
      </SettingsAlert>

      <div className="set-roles-layout">
        <RoleManager
          roles={store.roles}
          roleDefinitions={store.roleDefinitions}
          activeRole={activeRole}
          onSelectRole={setActiveRole}
        />
        <PermissionMatrix
          roleId={activeRole}
          permissions={store.roles[activeRole]}
          onChange={store.updateRolePermissions}
          onCopy={store.copyRolePermissions}
          roles={store.roles}
          roleDefinitions={store.roleDefinitions}
        />
      </div>
    </div>
  )
}
