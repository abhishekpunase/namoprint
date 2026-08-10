import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { CouponBox } from '../components/checkout/CouponBox'
import { getStoredCoupon } from '../data/coupons'
import { useAuth } from '../hooks/useAuth'
import { resolveCartProduct, useCart } from '../hooks/useCart'
import { CustomizationSummary } from '../components/shared/CustomizationSummary'
import { TShirtPrintAssets } from '../components/shared/TShirtPrintAssets'
import { getCustomizationPreviewUrl } from '../utils/customizationDisplay'
import { isTShirtLineItem } from '../utils/tShirtOrderAssets'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { formatCurrency } from '../utils/format'
import { calculateCheckoutTotals } from '../utils/checkoutTotals'

function CartItemCard({ item, onUpdateQty, onRemove }) {
  const product = resolveCartProduct(item)
  const previewUrl = getCustomizationPreviewUrl(item)
  const lineTotal = (item.unitPrice || 0) * (item.quantity || 1)
  const isTShirt = isTShirtLineItem(item)

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E4DC] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        {/* Thumbnail(s) */}
        {isTShirt ? (
          <TShirtPrintAssets item={item} variant="cart" className="mx-auto sm:mx-0" />
        ) : (
        <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] sm:mx-0 sm:h-24 sm:w-24">
          {previewUrl ? (
            <img src={resolveMediaUrl(previewUrl)} alt="" className="h-full w-full object-contain p-1" />
          ) : product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#8B9D83]">
              {product.title?.slice(0, 2)?.toUpperCase()}
            </span>
          )}
        </div>
        )}

        {/* Details */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex items-start justify-between gap-3 sm:justify-start">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#16171B] sm:pr-8">
              {product.title}
            </h3>
            <button
              type="button"
              onClick={() => onRemove(item._id)}
              className="hidden shrink-0 rounded-lg p-2 text-[#B8B4AA] transition hover:bg-red-50 hover:text-[#C8443C] sm:inline-flex"
              aria-label="Remove item"
            >
              <FiTrash2 size={18} />
            </button>
          </div>

          <CustomizationSummary
            customization={item.customization}
            item={item}
            variant="chips"
            className="mt-3 justify-center sm:justify-start"
          />

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:justify-start">
            <span className="text-[#6B6F76]">
              {formatCurrency(item.unitPrice)} each
            </span>
            <span className="hidden text-[#D8D4CB] sm:inline">·</span>
            <strong className="font-semibold text-[#16171B]">{formatCurrency(lineTotal)}</strong>
          </div>
        </div>

        {/* Quantity — horizontal, fixed height */}
        <div className="flex items-center justify-center gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
          <div className="inline-flex h-9 shrink-0 items-center rounded-full border border-[#E4E1DA] bg-[#FAFAF8] px-1">
            <button
              type="button"
              onClick={() => onUpdateQty(item._id, Math.max(1, item.quantity - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#16171B] transition hover:bg-white"
              aria-label="Decrease quantity"
            >
              <FiMinus size={14} />
            </button>
            <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQty(item._id, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#16171B] transition hover:bg-white"
              aria-label="Increase quantity"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item._id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[#C8443C] transition hover:bg-red-50 sm:hidden"
          >
            <FiTrash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </article>
  )
}

function OrderSummaryPanel({ totals, couponCode, freeShippingGap, checkoutHref = '/checkout', className = '' }) {
  return (
    <aside
      className={`relative overflow-hidden rounded-2xl bg-[#16171B] p-6 text-white shadow-xl sm:p-7 ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute -top-2 left-4 right-4 h-4 bg-[#16171B] sm:left-6 sm:right-6"
        style={{
          maskImage: 'radial-gradient(circle at 8px 0, transparent 8px, black 8.5px)',
          maskSize: '16px 16px',
          maskRepeat: 'repeat-x',
          WebkitMaskImage: 'radial-gradient(circle at 8px 0, transparent 8px, black 8.5px)',
          WebkitMaskSize: '16px 16px',
          WebkitMaskRepeat: 'repeat-x',
        }}
      />

      <h2 className="font-[Space_Grotesk,sans-serif] text-lg font-bold">Order summary</h2>

      <div className="mt-5 space-y-3 border-b border-dashed border-white/20 pb-5 text-sm">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span className="font-medium text-white">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-[#8FBF86]">
            <span>Discount{couponCode ? ` (${couponCode})` : ''}</span>
            <span>-{formatCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-white/70">
          <span>Shipping</span>
          <span className={totals.shipping ? 'font-medium text-white' : 'font-medium text-[#8FBF86]'}>
            {totals.shipping ? formatCurrency(totals.shipping) : 'Free'}
          </span>
        </div>
        {freeShippingGap > 0 && !totals.freeShipping && (
          <p className="text-xs leading-relaxed text-white/50">
            Add {formatCurrency(freeShippingGap)} more for free shipping.
          </p>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-sm text-white/70">Total</span>
        <strong className="font-[Space_Grotesk,sans-serif] text-2xl tabular-nums">{formatCurrency(totals.total)}</strong>
      </div>

      <Link
        to={checkoutHref}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#C8443C] py-3.5 text-sm font-semibold text-white transition hover:bg-[#B23A33] active:scale-[0.99]"
      >
        Checkout <FiArrowRight />
      </Link>
    </aside>
  )
}

export function CartPage() {
  const { isAuthenticated } = useAuth()
  const { cart, subtotal, updateItem, removeItem, count, syncToServer } = useCart()
  const [couponCode, setCouponCode] = useState(() => getStoredCoupon())

  useEffect(() => {
    if (!isAuthenticated) return
    syncToServer().catch(() => {})
  }, [isAuthenticated, syncToServer])

  const totals = useMemo(
    () => calculateCheckoutTotals(subtotal, { couponCode, totalQuantity: count }),
    [subtotal, couponCode, count],
  )

  const freeShippingGap = Math.max(0, 999 - subtotal)
  const itemCount = cart.items?.length || 0

  return (
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8443C]">Cart</span>
            <span className="rounded-full bg-[#F1EFE9] px-2.5 py-0.5 text-xs font-medium text-[#6B6F76]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <h1 className="font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight text-[#16171B] sm:text-4xl lg:text-5xl">
            Your personalised order
          </h1>
        </div>
        <Link
          to="/products"
          className="hidden text-sm font-medium text-[#6B6F76] underline-offset-2 hover:text-[#16171B] hover:underline sm:inline"
        >
          Continue shopping
        </Link>
      </div>

      {!cart.items?.length ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FBF9F6] px-6 py-16 text-center sm:py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <FiShoppingBag className="h-6 w-6 text-[#C8443C]" />
          </div>
          <p className="max-w-sm text-lg text-[#6B6F76]">Nothing here yet — your cart is waiting for a design.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#16171B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2B2C31]"
          >
            Start designing <FiArrowRight />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item._id}
                    item={item}
                    onUpdateQty={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <CouponBox
                localOnly
                subtotal={subtotal}
                itemCount={count}
                onApplied={(code) => setCouponCode(code || '')}
              />
            </div>

            {/* Desktop order summary */}
            <OrderSummaryPanel
              totals={totals}
              couponCode={couponCode}
              freeShippingGap={freeShippingGap}
              className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
            />
          </div>

          {/* Mobile / tablet sticky checkout bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E1DA] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#6B6F76]">Total ({itemCount} items)</p>
                <p className="text-xl font-bold tabular-nums text-[#16171B]">{formatCurrency(totals.total)}</p>
              </div>
              <Link
                to="/checkout"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C8443C] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#B23A33]"
              >
                Checkout <FiArrowRight />
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
