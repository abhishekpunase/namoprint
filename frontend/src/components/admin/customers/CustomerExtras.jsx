import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

export function WishlistCard() {
  return (
    <section className="crm-panel">
      <h2><Heart size={18} /> Wishlist</h2>
      <div className="crm-empty crm-todo-panel">
        <p>Wishlist feature is not available in the backend yet.</p>
        <small>TODO: Wishlist model &amp; GET /api/admin/users/:id/wishlist</small>
        <div className="crm-todo-actions">
          <button type="button" className="crm-btn crm-btn--ghost" disabled><ShoppingCart size={16} /> Move to Cart (TODO)</button>
          <button type="button" className="crm-btn crm-btn--ghost" disabled><Trash2 size={16} /> Remove (TODO)</button>
        </div>
      </div>
    </section>
  )
}

export function CartCard() {
  return (
    <section className="crm-panel">
      <h2><ShoppingCart size={18} /> Cart &amp; Abandoned Cart</h2>
      <div className="crm-empty crm-todo-panel">
        <p>Admin cart view requires a backend endpoint.</p>
        <small>TODO: GET /api/admin/users/:id/cart or GET /api/admin/carts</small>
        <p className="crm-todo-hint">Customer cart APIs exist at <code>/api/cart</code> (authenticated customer only).</p>
      </div>
    </section>
  )
}

export function ReviewList() {
  return (
    <section className="crm-panel">
      <h2>Reviews</h2>
      <div className="crm-empty crm-todo-panel">
        <p>No review system in the backend yet.</p>
        <small>TODO: Review model &amp; admin review APIs</small>
        <button type="button" className="crm-btn crm-btn--ghost" disabled>Reply (TODO)</button>
      </div>
    </section>
  )
}

export function LoyaltyCard({ customer }) {
  const coupons = customer?.usedCoupons || []
  return (
    <section className="crm-panel">
      <h2>Loyalty &amp; Rewards</h2>
      <div className="crm-loyalty-grid">
        <div className="crm-analytics__card"><span>Reward Points</span><strong className="crm-todo">— (TODO)</strong></div>
        <div className="crm-analytics__card"><span>Membership Tier</span><strong>{customer?.meta?.vip ? 'VIP' : 'Standard'}</strong></div>
        <div className="crm-analytics__card"><span>Coupons Used</span><strong>{coupons.length}</strong></div>
      </div>
      {coupons.length > 0 ? (
        <ul className="crm-coupon-list">
          {coupons.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      ) : (
        <p className="crm-empty-inline">No coupons redeemed yet</p>
      )}
    </section>
  )
}

export function CommunicationCard() {
  return (
    <section className="crm-panel">
      <h2>Communication</h2>
      <div className="crm-comm-actions">
        <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO: email API">Email Customer (TODO)</button>
        <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO: SMS API">SMS (TODO)</button>
        <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO">Push Notification (TODO)</button>
      </div>
      <button type="button" className="crm-btn crm-btn--ghost" disabled title="Uses existing forgot-password flow for customer">Reset Password Link (TODO: admin trigger)</button>
    </section>
  )
}
