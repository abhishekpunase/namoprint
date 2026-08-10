import { useEffect, useMemo, useState } from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { GodProductCard } from '../components/god/GodProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { FixedProductGallery } from '../components/product/FixedProductGallery'
import { ProductDetailsTabs } from '../components/product/ProductDetailsTabs'
import { ProductBreadcrumb, ProductCategoryBadge } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { godApi } from '../services/godApi'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

export default function GodProductDetailPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addGodItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    godApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    const imageParam = Number(searchParams.get('image'))
    if (Number.isInteger(imageParam) && imageParam >= 0) {
      setActiveImage(imageParam)
    } else {
      setActiveImage(0)
    }
  }, [searchParams, slug])

  useEffect(() => {
    if (!product?.images?.length) return
    setActiveImage((current) => Math.min(current, product.images.length - 1))
  }, [product])

  useEffect(() => {
    if (!product) return
    godApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        const sameDeity = items.filter((item) => item.deity && item.deity === product.deity)
        const others = items.filter((item) => !item.deity || item.deity !== product.deity)
        setRelatedProducts([...sameDeity, ...others].slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug, product])

  const detailProduct = useMemo(() => {
    if (!product) return null
    const heroImage = resolveMediaUrl(product.images?.[activeImage] || product.images?.[0])
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      heroImageUrl: heroImage,
      previewImageUrl: heroImage,
      brand: 'NAMOPRINT',
      badges: product.highlights?.slice(0, 4) || ['Made in India', 'Ready to Hang', 'Premium Print', 'Fast Delivery'],
      longDescription: product.description,
      gallery: (product.images || []).map(resolveMediaUrl).filter(Boolean),
      specs: [
        { label: 'Deity', value: product.deity || 'God Photo Frame' },
        {
          label: 'Available sizes',
          value: (product.qualityOptions || []).map((option) => option.label).join(' · ') || '—',
        },
        {
          label: 'Price range',
          value: (() => {
            const prices = (product.qualityOptions || []).map((option) => option.price).filter(Number.isFinite)
            if (!prices.length) return '—'
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            return min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`
          })(),
        },
        { label: 'Type', value: 'Readymade — no customization required' },
        { label: 'Production time', value: '1–2 business days' },
        { label: 'Shipping', value: 'Pan-India delivery' },
      ],
    }
  }, [product, activeImage])

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const selectedOption = product.qualityOptions.find((o) => o._id === selectedOptionId)
  const total = (selectedOption?.price || 0) * quantity

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/god-photo-frames/${slug}` } })
      return
    }
    if (!selectedOption) {
      setMessage('Please choose a size/quality option.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addGodItem({ godProduct: product, qualityOption: selectedOption, quantity })
      navigate('/cart')
    } catch (err) {
      setMessage(err.message || 'Could not add to cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <ProductPageSeo
        product={product}
        pathPrefix="/god-photo-frames"
        listLabel="God Photo Frames"
        listPath="/god-photo-frames"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/god-photo-frames"
          categoryLabel="God Photo Frames"
          productTitle={product.title}
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <FixedProductGallery
              images={product.images}
              activeIndex={activeImage}
              alt={product.title}
              onSelect={(index) => {
                setActiveImage(index)
                navigate(`/god-photo-frames/${slug}?image=${index}`, { replace: true })
              }}
            />
          </div>

          <div>
            <ProductCategoryBadge>
              {product.deity || 'God Photo Frame'} · Readymade
            </ProductCategoryBadge>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.title}</h1>
            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
              descriptionClassName="text-slate-500"
            />

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Choose Quality & Size</p>
              <div className="space-y-2">
                {product.qualityOptions.map((option) => (
                  <label
                    key={option._id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 transition ${
                      selectedOptionId === option._id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="quality"
                        checked={selectedOptionId === option._id}
                        onChange={() => setSelectedOptionId(option._id)}
                      />
                      {option.label}
                    </span>
                    <span className="font-bold text-orange-600">{formatCurrency(option.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="font-semibold text-slate-800">Quantity</span>
              <div className="flex items-center rounded-full border border-gray-300">
                <button type="button" className="px-4 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span className="px-4">{quantity}</span>
                <button type="button" className="px-4 py-2" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <span className="ml-auto text-xl font-extrabold text-orange-600">{formatCurrency(total)}</span>
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || !selectedOptionId}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
            >
              <FiShoppingCart />
              {adding ? 'Adding to cart…' : `Add to Cart · ${formatCurrency(total)}`}
            </button>

            <p className="mt-3 text-center text-sm text-slate-500">
              Same checkout as other products — review cart, then pay on{' '}
              <Link to="/checkout" className="font-medium text-orange-600 hover:underline">checkout page</Link>.
            </p>
          </div>
        </div>
      </section>

      {detailProduct && <ProductDetailsTabs product={detailProduct} />}

      <RelatedProductsSection viewAllHref="/god-photo-frames" gridClassName="sm:grid-cols-2 lg:grid-cols-3">
        {relatedProducts.map((item) => (
          <GodProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
