import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiUploadCloud, FiShoppingCart, FiStar } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CorporateGiftProductCard } from '../components/corporategift/CorporateGiftProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductDetailsTabs } from '../components/product/ProductDetailsTabs'
import { ProductBreadcrumb } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { corporateGiftApi } from '../services/corporateGiftApi'
import { api } from '../services/api'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { mapReviewsForDisplay } from '../utils/reviewDisplay'

function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export default function CorporateGiftProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addCorporateGiftItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [designFileUrl, setDesignFileUrl] = useState('')
  const [designFileName, setDesignFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    corporateGiftApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
        setQuantity(Math.max(1, payload.product?.minOrderQty || 1))
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    api
      .reviews(`?productSlug=${encodeURIComponent(slug)}`)
      .then(async (payload) => {
        let items = payload?.reviews || []
        if (!items.length) {
          const fallback = await api.reviews('?productType=corporate-gift')
          items = fallback?.reviews || []
        }
        setReviews(mapReviewsForDisplay(items))
      })
      .catch(() => setReviews([]))
  }, [slug])

  useEffect(() => {
    if (!product) return
    corporateGiftApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        setRelatedProducts(items.slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug, product])

  const selectedOption = useMemo(
    () => product?.qualityOptions?.find((o) => o._id === selectedOptionId),
    [product, selectedOptionId],
  )

  const detailProduct = useMemo(() => {
    if (!product) return null
    const heroImage = resolveMediaUrl(product.images?.[activeImage] || product.images?.[0])
    const prices = (product.qualityOptions || []).map((option) => option.price).filter(Number.isFinite)
    const min = prices.length ? Math.min(...prices) : 0
    const max = prices.length ? Math.max(...prices) : 0

    return {
      id: product._id,
      title: product.title,
      description: product.description,
      longDescription: product.description,
      heroImageUrl: heroImage,
      previewImageUrl: heroImage,
      brand: 'NAMOPRINT',
      badges: product.highlights?.slice(0, 4) || [
        'Custom branding',
        'Bulk orders',
        'Premium finish',
        'Pan-India delivery',
      ],
      gallery: (product.images || []).map(resolveMediaUrl).filter(Boolean),
      specs: [
        { label: 'Category', value: 'Corporate Gift' },
        {
          label: 'Available options',
          value: (product.qualityOptions || []).map((option) => option.label).join(' · ') || '—',
        },
        {
          label: 'Price range',
          value: min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`,
        },
        { label: 'Minimum order', value: `${product.minOrderQty || 1} piece(s)` },
        { label: 'Design file', value: 'Logo / artwork upload (any format)' },
        { label: 'Production time', value: '2–4 business days' },
        { label: 'Shipping', value: 'Pan-India delivery' },
      ],
    }
  }, [product, activeImage])

  const total = (selectedOption?.price || 0) * quantity
  const discount = discountPercent(selectedOption?.price, selectedOption?.compareAtPrice)
  const minQty = Math.max(1, product?.minOrderQty || 1)
  const canAddToCart = Boolean(selectedOptionId && designFileUrl && quantity >= minQty)

  const uploadDesignFile = useCallback(async (file) => {
    if (!file) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/corporate-gifts/${slug}` } })
      return
    }
    setUploading(true)
    setMessage('')
    try {
      const payload = await api.uploadDesign(file)
      const url = payload.asset?.url || payload.asset?.optimizedUrl
      if (url) {
        setDesignFileUrl(url)
        setDesignFileName(file.name)
      }
    } catch (err) {
      setMessage(err.message || 'Could not upload design file.')
    } finally {
      setUploading(false)
    }
  }, [isAuthenticated, navigate, slug])

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadDesignFile(file)
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const whatsappNumber = String(product.whatsappNumber || '919098570277').replace(/\D/g, '')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi NamoPrint, I want a custom design for ${product.title || 'corporate gift'}.`,
  )}`

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/corporate-gifts/${slug}` } })
      return
    }
    if (!designFileUrl) {
      setMessage('Please upload your logo or design file.')
      return
    }
    if (quantity < minQty) {
      setMessage(`Minimum order quantity is ${minQty}.`)
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addCorporateGiftItem({
        corporateGiftProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: {
          designFileUrl,
          designFileName,
        },
      })
      navigate('/cart')
    } catch (err) {
      setMessage(err.message || 'Could not add to cart.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <ProductPageSeo
        product={product}
        pathPrefix="/corporate-gifts"
        listLabel="Corporate Gifts"
        listPath="/corporate-gifts"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/corporate-gifts"
          categoryLabel="Corporate Gifts"
          productTitle={product.title}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img
                src={resolveMediaUrl(product.images?.[activeImage])}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      i === activeImage ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img src={resolveMediaUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Corporate Gift
            </span>

            <h1 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">{product.title}</h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-slate-800">({product.ratingScore || 4.8})</span>
              <span>• {product.reviewCountLabel || '120+ Reviews'}</span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-extrabold text-orange-600">{formatCurrency(selectedOption?.price || 0)}</span>
                {selectedOption?.compareAtPrice > selectedOption?.price && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatCurrency(selectedOption.compareAtPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes</p>
            </div>

            {product.description && (
              <ProductDescriptionExpandable
                className="mt-4"
                description={product.description}
                highlights={product.highlights}
                descriptionClassName="text-slate-600"
              />
            )}

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Choose option</p>
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

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-semibold text-slate-800">Quantity</span>
              <div className="flex items-center rounded-full border border-gray-300 bg-white">
                <button
                  type="button"
                  className="px-4 py-2"
                  onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
                >
                  -
                </button>
                <span className="min-w-[2rem] text-center">{quantity}</span>
                <button type="button" className="px-4 py-2" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>
              <span className="text-sm text-slate-500">(Minimum order: {minQty} piece{minQty > 1 ? 's' : ''})</span>
              <span className="ml-auto text-xl font-extrabold text-orange-600">{formatCurrency(total)}</span>
            </div>

            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-sm text-orange-900">
              <strong>Bulk Order Discount:</strong>{' '}
              {product.bulkOrderNote ||
                'Order 50+ items and get 15% OFF. Contact us for custom branding.'}
            </div>

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Upload Your Logo / Design</p>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  dragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-slate-50'
                }`}
              >
                <FiUploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-sm text-slate-600">
                  Drag & Drop your files or{' '}
                  <label className="cursor-pointer font-semibold text-orange-600 hover:underline">
                    Browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => uploadDesignFile(e.target.files?.[0])}
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, PDF, AI, EPS, SVG, ZIP — any design format</p>
                {uploading && <p className="mt-2 text-sm text-orange-600">Uploading…</p>}
                {designFileName && (
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700">
                    ✓ {designFileName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Note: Our team will send a design preview for your approval after the order is confirmed.
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || !canAddToCart}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
            >
              <FiShoppingCart />
              {adding ? 'Adding to cart…' : `Add to Cart · ${formatCurrency(total)}`}
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#1ebe57]"
            >
              <FaWhatsapp className="h-5 w-5" />
              Contact on WhatsApp for Custom Design
            </a>

            <p className="mt-3 text-center text-sm text-slate-500">
              Same checkout as other products —{' '}
              <Link to="/checkout" className="font-medium text-orange-600 hover:underline">
                checkout page
              </Link>
            </p>
          </div>
        </div>
      </section>

      {detailProduct && <ProductDetailsTabs product={detailProduct} reviews={reviews} />}

      <RelatedProductsSection viewAllHref="/corporate-gifts">
        {relatedProducts.map((item) => (
          <CorporateGiftProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
