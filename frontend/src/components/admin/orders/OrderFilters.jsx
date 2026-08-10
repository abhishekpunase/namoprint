import { useState } from 'react'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../../utils/orderAdminUtils'

export function OrderSearchBar({ value, onChange }) {
  return (
    <label className="ord-search" htmlFor="order-global-search">
      <Search size={18} aria-hidden="true" />
      <input
        id="order-global-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search order ID, customer, email, phone, product, tracking, payment ID…"
        aria-label="Search orders"
      />
    </label>
  )
}

const DATE_PRESETS = [
  { value: '', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
]

export function OrderFilters({ filters, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`ord-filters ${open ? 'is-open' : ''}`}>
      <button type="button" className="ord-filters__toggle" onClick={() => setOpen((v) => !v)}>
        <SlidersHorizontal size={16} />
        <strong>Filters</strong>
        <ChevronDown size={16} className="ord-filters__chevron" />
      </button>
      <div className="ord-filters__body">
        <div className="ord-filters__grid">
          <label>
            Date
            <select value={filters.dateRange} onChange={(e) => onChange({ ...filters, dateRange: e.target.value })}>
              {DATE_PRESETS.map((p) => (
                <option key={p.value || 'all'} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label>
            Order Status
            <select value={filters.orderStatus} onChange={(e) => onChange({ ...filters, orderStatus: e.target.value })}>
              <option value="">All</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Payment Status
            <select value={filters.paymentStatus} onChange={(e) => onChange({ ...filters, paymentStatus: e.target.value })}>
              <option value="">All</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Payment Method
            <select value={filters.paymentMethod} onChange={(e) => onChange({ ...filters, paymentMethod: e.target.value })}>
              <option value="">All</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </label>
          <label>
            Coupon
            <select value={filters.coupon} onChange={(e) => onChange({ ...filters, coupon: e.target.value })}>
              <option value="">All</option>
              <option value="yes">With coupon</option>
              <option value="no">Without coupon</option>
            </select>
          </label>
          <label>
            Min amount
            <input type="number" min="0" value={filters.amountMin} onChange={(e) => onChange({ ...filters, amountMin: e.target.value })} />
          </label>
          <label>
            Max amount
            <input type="number" min="0" value={filters.amountMax} onChange={(e) => onChange({ ...filters, amountMax: e.target.value })} />
          </label>
          <label>
            Staff
            <select value={filters.staff} onChange={(e) => onChange({ ...filters, staff: e.target.value })} disabled title="TODO: staff assignment API">
              <option value="">All</option>
            </select>
            <span className="ord-todo">TODO</span>
          </label>
          {(filters.dateRange === 'custom' || filters.dateFrom || filters.dateTo) && (
            <>
              <label>
                From
                <input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value, dateRange: 'custom' })} />
              </label>
              <label>
                To
                <input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value, dateRange: 'custom' })} />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
