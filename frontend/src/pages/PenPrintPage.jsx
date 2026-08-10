import { useEffect, useState } from 'react'
import { PenPrintProductCard } from '../components/penprint/PenPrintProductCard'
import { penPrintApi } from '../services/penPrintApi'

export default function PenPrintPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    penPrintApi
      .list()
      .then((payload) => setProducts(payload.items || []))
      .catch(() => setError('Could not load products right now.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-center text-white lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur">
            Pen Print
          </span>
          <h1 className="mt-5 text-4xl font-bold lg:text-5xl">Custom Name Printed Pens</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Pick a pen design, enter the name you want printed, choose your pack size — and we'll handle the rest.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {loading && <p className="text-center text-slate-500">Loading products…</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <PenPrintProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-slate-500">No products available right now. Please check back soon.</p>
        )}
      </div>
    </section>
  )
}
