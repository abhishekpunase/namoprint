import { useEffect, useState } from 'react'
import { BabyBirthFrameProductCard } from '../components/babybirthframe/BabyBirthFrameProductCard'
import { babyBirthFrameApi } from '../services/babyBirthFrameApi'

export default function BabyBirthFramePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    babyBirthFrameApi
      .list()
      .then((payload) => setProducts(payload.items || []))
      .catch(() => setError('Could not load baby birth frame products right now.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-pink-300 to-orange-200" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-center text-white lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur">
            Baby Birth Frames
          </span>
          <h1 className="mt-5 text-4xl font-bold lg:text-5xl">Personalized Baby Birth Frames</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Capture your little one&apos;s arrival with a custom birth frame — name, date, weight, height, and photos
            included.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {loading && <p className="text-center text-slate-500">Loading products…</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <BabyBirthFrameProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-slate-500">No baby birth frame products available yet.</p>
        )}
      </div>
    </section>
  )
}
