import { Link } from 'react-router-dom'
import { Mail, Phone, Shield, ShoppingBag } from 'lucide-react'
import { formatUserDate, getUserId, getUserInitials } from '../../../utils/userAdminUtils'

export function UserDetailView({ user, orders, meta, onToggleStatus, onUpdateMeta, saving, message }) {
  if (!user) return null
  const id = getUserId(user)

  return (
    <div className="usr-detail">
      {message ? <p className="usr-message">{message}</p> : null}

      <section className="usr-panel usr-profile-hero">
        <span className="usr-avatar usr-avatar--lg">{getUserInitials(user.name)}</span>
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <div className="usr-profile-badges">
            <span className={`usr-role usr-role--${user.role}`}><Shield size={14} /> {user.role}</span>
            <span className={`usr-status ${user.isActive !== false ? 'is-active' : 'is-disabled'}`}>
              {user.isActive !== false ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="usr-profile-actions">
          {user.role !== 'admin' && (
            <button type="button" className="usr-btn usr-btn--ghost" onClick={onToggleStatus} disabled={saving}>
              {user.isActive !== false ? 'Disable User' : 'Enable User'}
            </button>
          )}
          <Link to="/admin/users" className="usr-btn usr-btn--ghost">← Back to users</Link>
        </div>
      </section>

      <div className="usr-detail-grid">
        <section className="usr-panel">
          <h2>Personal Info</h2>
          <dl className="usr-dl">
            <div><dt><Mail size={14} /> Email</dt><dd>{user.email}</dd></div>
            <div><dt><Phone size={14} /> Phone</dt><dd>{user.phone || '—'}</dd></div>
            <div><dt>Created</dt><dd>{formatUserDate(user.createdAt)}</dd></div>
            <div><dt>Last Login</dt><dd>{formatUserDate(meta.lastLogin) || '—'}</dd></div>
          </dl>
          <label className="usr-field">
            Department <small>(local metadata — TODO: backend)</small>
            <input
              defaultValue={meta.department || ''}
              onBlur={(e) => onUpdateMeta({ department: e.target.value })}
              placeholder="Sales, Support, Warehouse…"
            />
          </label>
          <label className="usr-field">
            UI Role Label <small>(local metadata)</small>
            <input
              defaultValue={meta.uiRole || ''}
              onBlur={(e) => onUpdateMeta({ uiRole: e.target.value })}
              placeholder="Manager, Editor…"
            />
          </label>
        </section>

        <section className="usr-panel">
          <h2>Permissions</h2>
          <p className="usr-todo">Backend supports <code>customer</code> and <code>admin</code> only. Role editing requires TODO API.</p>
          <ul className="usr-perm-list">
            <li>{user.role === 'admin' ? 'Full admin access' : 'Customer storefront access'}</li>
            <li>{user.role === 'admin' ? 'Can access /admin routes' : 'Cannot access admin panel'}</li>
          </ul>
        </section>

        <section className="usr-panel usr-panel--wide">
          <h2><ShoppingBag size={18} /> Recent Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="usr-empty-inline">No orders for this user.</p>
          ) : (
            <div className="usr-orders-mini">
              <table className="usr-mini-table">
                <thead>
                  <tr><th>Order</th><th>Status</th><th>Total</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order._id || order.id}>
                      <td><Link to={`/admin/orders/${order._id || order.id}`}>{order.orderNo}</Link></td>
                      <td>{order.status}</td>
                      <td>₹{order.totals?.total || 0}</td>
                      <td>{formatUserDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="usr-panel">
          <h2>Activity Timeline</h2>
          <ul className="usr-timeline">
            <li><time>{formatUserDate(user.createdAt)}</time><span>Account created</span></li>
            {meta.lastLogin ? <li><time>{formatUserDate(meta.lastLogin)}</time><span>Last login recorded (local)</span></li> : null}
            <li className="usr-todo-item">Login history API — TODO</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export function AddUserModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="usr-modal-backdrop" role="dialog" aria-modal="true">
      <div className="usr-modal">
        <h2>Add User</h2>
        <p className="usr-todo">Creating users via admin panel requires a backend API (POST /admin/users). Currently users register via /register or admin setup via /auth/admin/register.</p>
        <div className="usr-modal__actions">
          <button type="button" className="usr-btn usr-btn--ghost" onClick={onClose}>Close</button>
          <button type="button" className="usr-btn usr-btn--primary" disabled>Create User (TODO)</button>
        </div>
      </div>
    </div>
  )
}
