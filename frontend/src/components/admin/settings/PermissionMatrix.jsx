import { Copy, Shield } from 'lucide-react'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../../../utils/settingsAdminUtils'
import { SettingsAlert, SettingsPanel } from './SettingsForm'

export function RoleManager({ roles, roleDefinitions, activeRole, onSelectRole, onDuplicate }) {
  return (
    <div className="set-role-list">
      {roleDefinitions.map((role) => (
        <button
          key={role.id}
          type="button"
          className={`set-role-card ${activeRole === role.id ? 'is-active' : ''}`}
          onClick={() => onSelectRole(role.id)}
        >
          <Shield size={18} />
          <div>
            <strong>{role.name}</strong>
            <p>{role.description}</p>
            <small>Backend role: {role.backendRole}</small>
          </div>
        </button>
      ))}
      <button type="button" className="set-btn set-btn--ghost" disabled title="TODO: custom role API">
        + Custom Role (TODO)
      </button>
    </div>
  )
}

export function PermissionMatrix({ roleId, permissions, onChange, onCopy, roles, roleDefinitions }) {
  const allModules = PERMISSION_MODULES
  const allActions = PERMISSION_ACTIONS

  const toggleAll = (module, value) => {
    allActions.forEach((action) => onChange(roleId, module, action, value))
  }

  const roleName = roleDefinitions.find((r) => r.id === roleId)?.name || roleId

  return (
    <SettingsPanel
      title={`Permissions — ${roleName}`}
      description="UI permission matrix stored locally. Backend only supports customer/admin roles."
      actions={
        <select
          className="set-select-inline"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) onCopy(e.target.value, roleId)
            e.target.value = ''
          }}
        >
          <option value="">Copy from role…</option>
          {roleDefinitions.filter((r) => r.id !== roleId).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      }
    >
      <SettingsAlert type="info">
        Actual API authorization uses <code>authorize('admin')</code>. This matrix is for planning and will sync when RBAC API is available.
      </SettingsAlert>
      <div className="set-matrix-wrap">
        <table className="set-matrix">
          <thead>
            <tr>
              <th>Module</th>
              {allActions.map((a) => (
                <th key={a}>{a}</th>
              ))}
              <th>Select All</th>
            </tr>
          </thead>
          <tbody>
            {allModules.map((mod) => {
              const row = permissions?.[mod] || {}
              const allChecked = allActions.every((a) => row[a])
              return (
                <tr key={mod}>
                  <td><strong>{mod}</strong></td>
                  {allActions.map((action) => (
                    <td key={action}>
                      <input
                        type="checkbox"
                        checked={Boolean(row[action])}
                        onChange={(e) => onChange(roleId, mod, action, e.target.checked)}
                      />
                    </td>
                  ))}
                  <td>
                    <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(mod, e.target.checked)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="set-btn set-btn--ghost" disabled title="TODO">
        <Copy size={16} /> Duplicate Role (TODO)
      </button>
    </SettingsPanel>
  )
}
