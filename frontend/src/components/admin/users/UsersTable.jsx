import { Link } from 'react-router-dom'
import { Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatUserDate, getUserId, getUserInitials, getUserMeta } from '../../../utils/userAdminUtils'

export function UsersTable({
  users,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  onToggleStatus,
  density = 'comfortable',
}) {
  const show = (col) => visibleColumns.includes(col)

  const SortBtn = ({ col, label }) => (
    <button type="button" className="usr-sort-btn" onClick={() => onSort(col)}>
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )

  if (!users.length) {
    return (
      <div className="usr-empty">
        <p>No users found.</p>
        <small>Try adjusting search or filters.</small>
      </div>
    )
  }

  return (
    <>
      <div className="usr-table-wrap">
        <table className={`usr-table ${density === 'compact' ? 'usr-table--compact' : ''}`}>
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all" /></th>
              {show('avatar') && <th>Avatar</th>}
              {show('name') && <th><SortBtn col="name" label="Name" /></th>}
              {show('email') && <th><SortBtn col="email" label="Email" /></th>}
              {show('phone') && <th>Phone</th>}
              {show('role') && <th><SortBtn col="role" label="Role" /></th>}
              {show('department') && <th>Department</th>}
              {show('status') && <th>Status</th>}
              {show('lastLogin') && <th>Last Login</th>}
              {show('createdAt') && <th><SortBtn col="createdAt" label="Created" /></th>}
              {show('actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const id = getUserId(user)
              const meta = getUserMeta(id)
              return (
                <tr key={id} className="usr-table__row">
                  <td><input type="checkbox" checked={selected.includes(id)} onChange={() => onToggleSelect(id)} /></td>
                  {show('avatar') && (
                    <td><span className="usr-avatar">{getUserInitials(user.name)}</span></td>
                  )}
                  {show('name') && (
                    <td>
                      <Link to={`/admin/users/${id}`} className="usr-name-link"><strong>{user.name}</strong></Link>
                    </td>
                  )}
                  {show('email') && <td>{user.email}</td>}
                  {show('phone') && <td>{user.phone || '—'}</td>}
                  {show('role') && (
                    <td><span className={`usr-role usr-role--${user.role}`}>{user.role}</span></td>
                  )}
                  {show('department') && <td>{meta.department || '—'}</td>}
                  {show('status') && (
                    <td>
                      <span className={`usr-status ${user.isActive !== false ? 'is-active' : 'is-disabled'}`}>
                        {user.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  )}
                  {show('lastLogin') && <td>{formatUserDate(meta.lastLogin)}</td>}
                  {show('createdAt') && <td>{formatUserDate(user.createdAt)}</td>}
                  {show('actions') && (
                    <td>
                      <div className="usr-row-actions">
                        <Link to={`/admin/users/${id}`} className="usr-icon-btn" title="View profile"><Eye size={16} /></Link>
                        {user.role !== 'admin' && (
                          <button type="button" className="usr-icon-btn" title={user.isActive !== false ? 'Disable' : 'Enable'} onClick={() => onToggleStatus(user)}>
                            {user.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="usr-cards--mobile">
        {users.map((user) => {
          const id = getUserId(user)
          const meta = getUserMeta(id)
          return (
            <article key={id} className="usr-card">
              <div className="usr-card__head">
                <span className="usr-avatar">{getUserInitials(user.name)}</span>
                <div>
                  <Link to={`/admin/users/${id}`}><strong>{user.name}</strong></Link>
                  <p>{user.email}</p>
                </div>
                <span className={`usr-status ${user.isActive !== false ? 'is-active' : 'is-disabled'}`}>
                  {user.isActive !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="usr-card__meta">
                <span>{user.role}</span>
                <span>{meta.department || 'No department'}</span>
                <span>{formatUserDate(user.createdAt)}</span>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
