import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { catalogProductTypes, fallbackProducts } from '../data/fallbackCatalog'
import { api } from '../services/api'
import { mergeCatalogProducts } from '../utils/catalog'
import { getDedicatedListingPath } from '../config/categoryRoutes'
import { excludeWallWatchProducts } from '../utils/wallWatchCatalog'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState(fallbackProducts)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const activeType = searchParams.get('type') || ''
  const activeBtnRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeType) params.set('productType', activeType)
    if (query) params.set('q', query)
    api
      .products(params.toString() ? `?${params}` : '')
      .then((payload) => setProducts(mergeCatalogProducts(payload.items)))
      .catch(() => setProducts(fallbackProducts))
  }, [activeType, query])

  useEffect(() => {
    if (!activeType) return
    const dedicated = getDedicatedListingPath(activeType)
    if (dedicated) navigate(dedicated, { replace: true })
  }, [activeType, navigate])

  useEffect(() => {
    activeBtnRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeType])

  const filtered = useMemo(
    () =>
      excludeWallWatchProducts(products).filter((product) => {
        const matchesType = !activeType || product.productType === activeType
        const text = `${product.title} ${product.description}`.toLowerCase()
        return matchesType && text.includes(query.toLowerCase())
      }),
    [activeType, products, query],
  )

  const changeType = (type) => {
    if (type) {
      const dedicated = getDedicatedListingPath(type)
      if (dedicated) {
        navigate(dedicated)
        return
      }
    }
    const next = new URLSearchParams(searchParams)
    if (type) next.set('type', type)
    else next.delete('type')
    setSearchParams(next)
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-center lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-white">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md">
              ✨ Product Studio
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Design Products
              <br />
              <span className="text-yellow-200">That Everyone Loves</span>
            </h1>
            <p className="mt-6 text-lg text-orange-100">
              Choose your favourite product, upload your design, customize it and order in minutes.
            </p>
            <button
              type="button"
              onClick={() => changeType('')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-orange-600 duration-300 hover:scale-105"
            >
              Explore Products
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-6">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-xl">
          <div className="relative">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-orange-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Frames, Watches, Keychains..."
              className="w-full rounded-2xl border border-orange-200 py-4 pl-14 pr-5 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6">
        <div className="catalog-category-scroll flex scroll-smooth gap-4 overflow-x-auto pb-3">
          <button
            ref={!activeType ? activeBtnRef : null}
            type="button"
            onClick={() => changeType('')}
            className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all duration-300 ${
              !activeType
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'border border-orange-200 bg-white hover:bg-orange-50'
            }`}
          >
            All Products
          </button>
          {catalogProductTypes
            .filter((type) => !['custom-wall-watch', 'photo-clock'].includes(type.value))
            .map((type) => (
            <button
              key={type.value}
              ref={activeType === type.value ? activeBtnRef : null}
              type="button"
              onClick={() => changeType(type.value)}
              className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all duration-300 ${
                activeType === type.value
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'border border-orange-200 bg-white hover:bg-orange-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No products found{activeType ? ' in this category' : ''}. Try a different search or category.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
