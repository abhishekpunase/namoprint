import { FiCheckCircle } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../utils/format'

export function PaymentSuccessPage() {
  const { state } = useLocation()
  const order = state?.order

  return (
   <section className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-16">
  <div className="mx-auto flex max-w-3xl items-center justify-center px-4">

    <div className="w-full rounded-3xl bg-white p-10 shadow-2xl border border-gray-100">

      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
          <FiCheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      {/* Heading */}
      <div className="mt-8 text-center">

        <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          🎉 Order Placed Successfully
        </span>

        <h1 className="mt-5 text-4xl font-bold text-gray-900">
          Thank You for Your Order!
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Your order has been received successfully and is now being processed.
        </p>

      </div>

      {/* Order Card */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">

        <div className="flex items-center justify-between border-b border-gray-200 pb-4">

          <span className="text-gray-500">
            Order Number
          </span>

          <span className="rounded-lg bg-indigo-100 px-4 py-2 font-semibold text-indigo-700">
            #{order?.orderNo || "Pending"}
          </span>

        </div>

        <div className="mt-5 flex items-center justify-between">

          <span className="text-gray-500">
            Payment Status
          </span>

          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            Pending Verification
          </span>

        </div>

        <div className="mt-5 flex items-center justify-between">

          <span className="text-gray-500">
            Total Amount
          </span>

          <span className="text-2xl font-bold text-indigo-600">
            {order
              ? formatCurrency(order.totals?.total)
              : formatCurrency(0)}
          </span>

        </div>

      </div>

      {/* Information */}
      <div className="mt-8 rounded-2xl bg-indigo-50 p-6">

        <h3 className="font-semibold text-indigo-900">
          What's Next?
        </h3>

        <ul className="mt-4 space-y-3 text-sm text-indigo-700">

          <li className="flex items-start gap-3">
            ✅ Your order is being reviewed.
          </li>

          <li className="flex items-start gap-3">
            📦 We'll start preparing your items shortly.
          </li>

          <li className="flex items-start gap-3">
            🚚 You'll receive tracking details after shipment.
          </li>

          <li className="flex items-start gap-3">
            💳 Razorpay payment verification will update automatically.
          </li>

        </ul>

      </div>

      {/* Action Buttons */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">

        <Link
          to="/account/orders"
          className="flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl"
        >
          View My Orders
        </Link>

        <Link
          to="/products"
          className="flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 transition duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg"
        >
          Continue Shopping
        </Link>

      </div>

      {/* Bottom Trust Section */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <div className="grid gap-4 text-center sm:grid-cols-3">

          <div>
            <div className="text-2xl">🔒</div>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Secure Payment
            </p>
          </div>

          <div>
            <div className="text-2xl">🚚</div>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Fast Shipping
            </p>
          </div>

          <div>
            <div className="text-2xl">📞</div>
            <p className="mt-2 text-sm font-medium text-gray-700">
              24/7 Support
            </p>
          </div>

        </div>

      </div>

    </div>

  </div>
</section>
  )
}
