import { useEffect, useState } from 'react'
import { FiPackage } from 'react-icons/fi'
import { api } from '../services/api'
import { formatCurrency } from '../utils/format'

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .orders()
      .then((payload) => setOrders(payload.orders || []))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-100">
                My Orders
              </p>
  
              <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                Order History
              </h1>
  
              <p className="mt-3 max-w-2xl text-orange-100">
                Track your orders, payment status, shipping progress and print updates.
              </p>
            </div>
  
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <FiPackage size={42} />
            </div>
          </div>
        </div>
  
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
            {error}
          </div>
        )}
  
        {/* Empty Orders */}
        {!orders.length && !error ? (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FiPackage size={42} />
            </div>
  
            <h2 className="mt-6 text-2xl font-semibold text-gray-800">
              No Orders Yet
            </h2>
  
            <p className="mt-3 text-gray-500">
              Once you place an order, it will appear here.
            </p>
  
            <Link
              to="/products"
              className="mt-8 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
  
            {orders.map((order) => (
              <div
                key={order._id}
                className="group rounded-3xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
  
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold
                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-600"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
  
                    <h2 className="mt-4 text-xl font-bold text-gray-800">
                      {order.orderNo}
                    </h2>
  
                    <p className="mt-2 text-gray-500">
                      {order.items?.length || 0} Item(s)
                    </p>
                  </div>
  
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                    <FiPackage size={24} />
                  </div>
                </div>
  
                {/* Divider */}
                <div className="my-6 border-t border-gray-200"></div>
  
                {/* Total */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>
  
                    <h3 className="text-2xl font-bold text-orange-600">
                      {formatCurrency(order.totals?.total || 0)}
                    </h3>
                  </div>
  
                  <button className="rounded-xl border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition hover:bg-orange-500 hover:text-white">
                    View Details
                  </button>
                </div>
              </div>
            ))}
  
          </div>
        )}
      </div>
    </section>
  );
}
