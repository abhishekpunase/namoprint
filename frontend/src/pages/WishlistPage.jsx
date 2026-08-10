import { FiArrowRight, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistPage() {
  const { items } = useWishlist()

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <FiHeart className="fill-current" />
          </span>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Wishlist</h1>
            <p className="mt-1 text-sm text-slate-500">
              {items.length} {items.length === 1 ? 'product saved' : 'products saved'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-20 text-center">
            <FiHeart className="text-5xl text-orange-200" />
            <p className="text-lg text-slate-600">Your wishlist is empty. Like products to save them here.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Products
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ProductCard key={item.key} product={item.product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
