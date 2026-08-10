import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { godApi } from '../../services/godApi'
import { GodProductCard } from '../god/GodProductCard'

export default function GodHomeSection() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    godApi
      .list('?limit=4')
      .then((payload) => setProducts(payload.items || []))
      .catch(() => setProducts([]))
  }, [])

  if (!products.length) return null

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/40 to-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600">
              God Frame
            </span>
            <h2 className="mt-4 text-4xl font-bold text-slate-900">
              Readymade <span className="text-orange-500">God Photo Frames</span>
            </h2>
            <p className="mt-3 max-w-xl text-slate-500">
              Beautifully printed, ready-to-hang devotional photo frames. Just pick your quality and size —
              no customization needed.
            </p>
          </div>
          <Link
            to="/god-photo-frames"
            className="flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            View All
            <FiArrowRight />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <GodProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
