import { useEffect, useMemo, useState } from 'react'
import { FiCalendar, FiCreditCard, FiGift } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { CouponBox } from '../components/checkout/CouponBox'
import { getStoredCoupon, calculateLocalCouponDiscount, clearStoredCoupon } from '../data/coupons'
import { useAuth } from '../hooks/useAuth'
import { resolveCartProduct, useCart } from '../hooks/useCart'
import { CustomizationSummary } from '../components/shared/CustomizationSummary'
import { getCustomizationPreviewUrl } from '../utils/customizationDisplay'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { api } from '../services/api'
import { formatCurrency } from '../utils/format'
import { calculateCheckoutTotals } from '../utils/checkoutTotals'
import {
  SPECIAL_DATE_DISCOUNT_PERCENT,
  SPECIAL_DATE_WINDOW_DAYS,
  formatDateInputValue,
} from '../utils/specialDateDiscount'

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Razorpay checkout script failed to load. Check your internet connection.'))
    document.body.appendChild(script)
  })

const openRazorpayCheckout = ({ razorpay, order, address }) =>
  new Promise((resolve, reject) => {
    const instance = new window.Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      name: 'Namo Prints',
      description: order.orderNo,
      order_id: razorpay.orderId,
      prefill: {
        name: address.fullName,
        email: address.email,
        contact: address.phone,
      },
      theme: { color: '#4f46e5' },
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled. Your order is saved — you can pay again from My Orders.')),
      },
    })
    instance.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed. Please try again.'))
    })
    instance.open()
  })

export function CheckoutPage() {
  const { user } = useAuth()
  const { cart, subtotal, clear, count, syncToServer } = useCart()
  const navigate = useNavigate()
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  const [address, setAddress] = useState({
    ...emptyAddress,
    fullName: defaultAddress?.fullName || user?.name || '',
    phone: defaultAddress?.phone || user?.phone || '',
    email: defaultAddress?.email || user?.email || '',
    line1: defaultAddress?.line1 || '',
    line2: defaultAddress?.line2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    pincode: defaultAddress?.pincode || '',
    country: defaultAddress?.country || 'India',
  })
  const [specialDate, setSpecialDate] = useState(formatDateInputValue(user?.specialDate))
  const [specialDateLabel, setSpecialDateLabel] = useState(user?.specialDateLabel || 'Birthday / Anniversary')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState(() => getStoredCoupon())
  const [cartLoading, setCartLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    syncToServer()
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setCartLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [syncToServer])

  const totals = useMemo(
    () =>
      calculateCheckoutTotals(subtotal, {
        specialDate: specialDate || user?.specialDate,
        couponCode,
        totalQuantity: count,
      }),
    [subtotal, specialDate, user?.specialDate, couponCode, count],
  )

  useEffect(() => {
    const saved = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
    if (!saved) return
    setAddress({
      ...emptyAddress,
      fullName: saved.fullName || user?.name || '',
      phone: saved.phone || user?.phone || '',
      email: saved.email || user?.email || '',
      line1: saved.line1 || '',
      line2: saved.line2 || '',
      city: saved.city || '',
      state: saved.state || '',
      pincode: saved.pincode || '',
      country: saved.country || 'India',
    })
  }, [user?.id, user?.addresses?.length])

  useEffect(() => {
    if (user?.specialDate) setSpecialDate(formatDateInputValue(user.specialDate))
    if (user?.specialDateLabel) setSpecialDateLabel(user.specialDateLabel)
  }, [user?.specialDate, user?.specialDateLabel])

  const update = (key, value) => setAddress((current) => ({ ...current, [key]: value }))

  const applySavedAddress = (saved) => {
    setAddress({
      ...emptyAddress,
      fullName: saved.fullName,
      phone: saved.phone,
      email: saved.email || user?.email || '',
      line1: saved.line1,
      line2: saved.line2 || '',
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      country: saved.country || 'India',
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const syncedCart = await syncToServer()
      if (!syncedCart?.items?.length) {
        throw new Error('Your cart is empty. Add products from the catalog first.')
      }

      const checkoutPayload = {
        customer: { name: address.fullName, email: address.email, phone: address.phone },
        shippingAddress: address,
      }

      if (specialDate) {
        checkoutPayload.specialDate = specialDate
        checkoutPayload.specialDateLabel = specialDateLabel.trim() || 'Special Day'
      }

      const normalizedCoupon = couponCode?.trim()
      if (normalizedCoupon) {
        const couponPreview = calculateLocalCouponDiscount(subtotal, count, normalizedCoupon)
        if (couponPreview.error) {
          clearStoredCoupon()
          setCouponCode('')
        } else {
          checkoutPayload.couponCode = normalizedCoupon
        }
      }

      const payload = await api.checkout(checkoutPayload)
      const order = payload.order

      const paymentPayload = await api.createPayment({ orderId: order._id })
      const razorpay = paymentPayload.razorpay

      if (!razorpay?.keyId || !razorpay?.orderId) {
        throw new Error('Payment gateway is not configured. Contact support or try again later.')
      }

      await loadRazorpay()
      const paymentResult = await openRazorpayCheckout({ razorpay, order, address })

      const verified = await api.verifyPayment({
        orderId: order._id,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature,
      })

      clear()
      navigate('/payment-success', { state: { order: verified.order } })
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const addressFields = ['fullName', 'phone', 'email', 'line1', 'line2', 'city', 'state', 'pincode', 'country']

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <form
            onSubmit={submit}
            className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-xl border border-gray-100"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Secure Checkout</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Delivery Details</h1>
            <p className="mt-2 text-gray-500">Enter your shipping information and special date for future discounts.</p>

            {user?.addresses?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Saved Addresses</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {user.addresses.map((saved) => (
                    <button
                      key={saved._id}
                      type="button"
                      onClick={() => applySavedAddress(saved)}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg"
                    >
                      <h4 className="font-semibold text-gray-900">{saved.fullName}</h4>
                      <p className="mt-2 text-sm text-gray-600">{saved.line1}</p>
                      {saved.line2 && <p className="text-sm text-gray-600">{saved.line2}</p>}
                      <p className="text-sm text-gray-600">
                        {saved.city}, {saved.state}
                      </p>
                      <p className="text-sm text-gray-600">{saved.pincode}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <FiGift className="mt-1 text-xl text-amber-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900">Your Special Date</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Add your birthday or anniversary. When you order within {SPECIAL_DATE_WINDOW_DAYS} days of that
                    date each year, you get {SPECIAL_DATE_DISCOUNT_PERCENT}% off automatically.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiCalendar />
                        Special date
                      </label>
                      <input
                        type="date"
                        value={specialDate}
                        onChange={(e) => setSpecialDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Label (optional)</label>
                      <input
                        value={specialDateLabel}
                        onChange={(e) => setSpecialDateLabel(e.target.value)}
                        placeholder="Birthday, Anniversary..."
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                  {totals.discountReason && (
                    <p
                      className={`mt-3 text-sm font-medium ${totals.discountApplied ? 'text-green-700' : 'text-amber-700'}`}
                    >
                      {totals.discountReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <CouponBox
              className="mt-10"
              subtotal={subtotal}
              itemCount={count}
              onApplied={(code) => setCouponCode(code || '')}
            />

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {addressFields.map((key) => (
                <div key={key} className={key === 'line2' ? 'md:col-span-2' : ''}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    required={!['line2'].includes(key)}
                    value={address[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!cart.items?.length || submitting || cartLoading}
              className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiCreditCard className="text-xl" />
              {cartLoading ? 'Loading cart…' : submitting ? 'Processing payment…' : 'Place Order & Pay with Razorpay'}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-8 shadow-xl lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

            {cart.items?.length ? (
              <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                {cart.items.map((item) => {
                  const product = resolveCartProduct(item)
                  const previewUrl = getCustomizationPreviewUrl(item)
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {previewUrl ? (
                          <img
                            src={resolveMediaUrl(previewUrl)}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                        <CustomizationSummary
                          customization={item.customization}
                          item={item}
                          variant="store"
                          showPreview={false}
                          showTitle={false}
                          compact
                          className="!text-xs !text-gray-500"
                        />
                        <p className="mt-1 text-sm font-semibold text-indigo-600">
                          {formatCurrency((item.unitPrice || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{cart.items?.length || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{couponCode ? ` (${couponCode})` : ''}</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">
                  {totals.shipping ? formatCurrency(totals.shipping) : 'Free'}
                </span>
              </div>
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-3xl font-bold text-indigo-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-indigo-50 p-5">
              <h4 className="font-semibold text-indigo-900">Secure Payment via Razorpay</h4>
              <p className="mt-2 text-sm text-indigo-700">
                UPI, cards, net banking — payment opens in Razorpay popup. Order is confirmed only after successful
                payment.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
