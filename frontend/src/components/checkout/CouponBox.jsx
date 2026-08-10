import { useEffect, useState } from 'react'
import { FiCheck, FiTag, FiX } from 'react-icons/fi'
import { api } from '../../services/api'
import {
  calculateLocalCouponDiscount,
  clearStoredCoupon,
  getStoredCoupon,
  normalizeCouponCode,
  storeCoupon,
} from '../../data/coupons'

export function CouponBox({ subtotal, itemCount, onApplied, className = '', localOnly = false }) {
  const [code, setCode] = useState(getStoredCoupon())
  const [appliedCode, setAppliedCode] = useState(getStoredCoupon())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = getStoredCoupon()
    if (!stored) return

    const preview = calculateLocalCouponDiscount(subtotal, itemCount, stored)
    if (!itemCount) return

    if (preview.error) {
      clearStoredCoupon()
      setCode('')
      setAppliedCode('')
      onApplied?.('')
      return
    }

    setCode(stored)
    setAppliedCode(stored)
    onApplied?.(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, itemCount])

  const applyCoupon = async () => {
    setError('')
    setMessage('')
    const normalized = normalizeCouponCode(code)

    // Coupon optional — blank field should never block checkout
    if (!normalized) {
      clearStoredCoupon()
      setAppliedCode('')
      onApplied?.('')
      return
    }

    if (localOnly) {
      const preview = calculateLocalCouponDiscount(subtotal, itemCount, normalized)
      if (preview.error) {
        setError(preview.error)
        return
      }
      storeCoupon(normalized)
      setAppliedCode(normalized)
      setMessage(preview.label || 'Coupon saved for checkout')
      onApplied?.(normalized)
      return
    }

    setLoading(true)
    try {
      const payload = await api.validateCoupon({ code: normalized })
      storeCoupon(normalized)
      setAppliedCode(normalized)
      setMessage(payload.coupon?.label || 'Coupon applied')
      onApplied?.(normalized, payload.totals)
    } catch (err) {
      setAppliedCode('')
      clearStoredCoupon()
      onApplied?.('')
      setError(err.message || 'Invalid coupon')
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setCode('')
    setAppliedCode('')
    setMessage('')
    setError('')
    clearStoredCoupon()
    onApplied?.('')
  }

  return (
    <div className={`rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-5 ${className}`}>
      <div className="flex items-center gap-2 text-indigo-900">
        <FiTag />
        <h3 className="font-semibold">Have a coupon?</h3>
      </div>
      <p className="mt-1 text-sm text-indigo-700">
        Optional — skip if you don&apos;t have a code. Try WELCOME10, BULK15 (5+ items), or FREESHIP (orders above ₹999).
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-3 uppercase tracking-wider outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        {appliedCode ? (
          <button
            type="button"
            onClick={removeCoupon}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <FiX /> Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={applyCoupon}
            disabled={loading || !itemCount}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Apply'}
          </button>
        )}
      </div>

      {appliedCode && message && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
          <FiCheck /> {message} — <span className="font-bold">{appliedCode}</span>
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {!itemCount && (
        <p className="mt-2 text-xs text-indigo-600">Add items to cart before applying a coupon.</p>
      )}
    </div>
  )
}
