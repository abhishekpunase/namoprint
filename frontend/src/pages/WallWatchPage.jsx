import { useEffect, useMemo, useState } from 'react'
import { WallWatchProductCard } from '../components/wallwatch/WallWatchProductCard'
import { fallbackProducts } from '../data/fallbackCatalog'
import { api } from '../services/api'
import { mergeCatalogProducts } from '../utils/catalog'
import { filterWallWatchProducts } from '../utils/wallWatchCatalog'

export default function WallWatchPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .products('')
      .then((payload) => {
        const merged = mergeCatalogProducts(payload.items || [])
        const watches = filterWallWatchProducts(merged.length ? merged : fallbackProducts)
        setProducts(watches)
      })
      .catch(() => {
        setProducts(filterWallWatchProducts(fallbackProducts))
        setError('')
      })
      .finally(() => setLoading(false))
  }, [])

  const sorted = useMemo(
    () => [...products].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)),
    [products],
  )

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-amber-900 to-orange-600" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-center text-white lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur">
            Custom Wall Watches
          </span>
          <h1 className="mt-5 text-4xl font-bold lg:text-5xl">Personalised Photo Wall Clocks</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Upload your photo, pick number style and colours — same designer and checkout as our other custom products.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {loading && <p className="text-center text-slate-500">Loading wall watches…</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((product) => (
              <WallWatchProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <p className="text-center text-slate-500">No wall watch products available yet. Please check back soon.</p>
        )}
      </div>
    </section>
  )
}
