import { useEffect, useMemo, useRef, useState } from 'react'
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiUpload } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from '../components/product/ProductDetailsTabs'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { TShirtProductCard } from '../components/tshirt/TShirtProductCard'
import { ProductBreadcrumb } from '../components/product/ProductBreadcrumb'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { api } from '../services/api'
import { tShirtApi } from '../services/tShirtApi'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function emptySizeMap(sizes) {
  return sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
}

export default function TShirtProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addTShirtItem } = useCart()
  const fileRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [sizeQuantities, setSizeQuantities] = useState(emptySizeMap(DEFAULT_SIZES))
  const [notes, setNotes] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoAssetId, setLogoAssetId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    tShirtApi
      .get(slug)
      .then((payload) => {
        const p = payload.product
        setProduct(p)
        setSizeQuantities(emptySizeMap(p?.sizes?.length ? p.sizes : DEFAULT_SIZES))
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    tShirtApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        setRelatedProducts(items.slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug])

  const sizes = product?.sizes?.length ? product.sizes : DEFAULT_SIZES
  const totalPieces = useMemo(
    () => Object.values(sizeQuantities).reduce((sum, n) => sum + (Number(n) || 0), 0),
    [sizeQuantities],
  )
  const totalAmount = (product?.price || 0) * totalPieces
  const discount =
    product?.compareAtPrice > product?.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0

  const updateSizeQty = (size, delta) => {
    setSizeQuantities((current) => ({
      ...current,
      [size]: Math.max(0, (current[size] || 0) + delta),
    }))
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Logo must be 5MB or smaller.')
      return
    }

    setUploading(true)
    setMessage('')
    try {
      const payload = await api.uploadPhoto(file)
      const asset = payload?.asset || payload
      setLogoAssetId(asset._id || '')
      setLogoPreview(asset.previewUrl || asset.optimizedUrl || asset.url || URL.createObjectURL(file))
    } catch {
      setMessage('Could not upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/t-shirt-printing/${slug}` } })
      return
    }
    if (totalPieces < 1) {
      setMessage('Please select at least one size quantity.')
      return
    }
    if (!logoPreview && !notes.trim()) {
      setMessage('Please upload a logo or add print instructions.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addTShirtItem({
        tShirtProduct: product,
        customization: {
          sizeQuantities,
          totalPieces,
          logoUrl: logoPreview,
          logoAssetId,
          notes: notes.trim(),
          productImageUrl: product.images?.[0] || '',
        },
      })
      navigate('/cart')
    } catch (err) {
      setMessage(err.message || 'Could not add to cart.')
    } finally {
      setAdding(false)
    }
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const detailProduct = {
    id: product._id,
    title: product.title,
    description: product.description,
    longDescription: product.longDescription || product.description,
    heroImageUrl: resolveMediaUrl(product.images?.[activeImage] || product.images?.[0]),
    previewImageUrl: resolveMediaUrl(product.images?.[activeImage] || product.images?.[0]),
    brand: 'NAMOPRINT',
    badges: product.highlights?.slice(0, 4) || ['Premium print', 'Custom logo', 'All sizes', 'Fast delivery'],
    gallery: (product.images || []).map(resolveMediaUrl).filter(Boolean),
    specs: [
      { label: 'Fabric', value: 'Premium cotton / dry-fit blend' },
      { label: 'Print', value: 'HD digital / screen print ready' },
      { label: 'Sizes', value: sizes.join(', ') },
      { label: 'File formats', value: 'JPG, PNG, SVG (max 5MB)' },
    ],
  }

  return (
    <>
      <ProductPageSeo
        product={product}
        pathPrefix="/t-shirt-printing"
        listLabel="T-Shirt Printing"
        listPath="/t-shirt-printing"
        price={product.price}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/t-shirt-printing"
          categoryLabel="T-Shirts"
          productTitle={product.title}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={resolveMediaUrl(product.images?.[activeImage] || product.images?.[0])}
                alt={product.title}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                      i === activeImage ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img src={resolveMediaUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product + customization */}
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-orange-600 sm:text-3xl">
              {product.title}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <FiStar className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800">{product.rating?.toFixed(1) || '4.5'}</span>
              <span>({product.reviewCount || 0} Reviews)</span>
            </div>

            <ProductDescriptionExpandable
              className="mt-4"
              description={product.description}
              highlights={product.highlights}
            />

            {/* Price box */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-end gap-3">
                {product.compareAtPrice > product.price && (
                  <span className="text-lg text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                )}
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</span>
                {discount > 0 && (
                  <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">SAVE {discount}%</span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">Per piece · all sizes same price</p>
            </div>

            {/* Upload logo */}
            <div className="mt-6">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/svg+xml,.svg" className="hidden" onChange={handleLogoUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-600 disabled:opacity-60"
              >
                <FiUpload />
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </button>
              <p className="mt-2 text-xs text-slate-500">Maximum file size: 5MB. Format: JPG, PNG, or SVG.</p>
              {logoPreview && (
                <div className="mt-3 inline-block rounded-lg border border-slate-200 bg-white p-2">
                  <img src={resolveMediaUrl(logoPreview)} alt="Uploaded logo" className="h-16 max-w-[160px] object-contain" />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Notes / Custom Text</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Mention any specific placement or text instructions here..."
                className="w-full rounded-xl border-2 border-orange-400 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Size grid */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                Select Sizes: {totalPieces} PCS
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                  >
                    <span className="text-lg font-bold text-slate-800">{size}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSizeQty(size, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label={`Decrease ${size}`}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="min-w-[1.25rem] text-center font-semibold tabular-nums">
                        {sizeQuantities[size] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSizeQty(size, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label={`Increase ${size}`}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
              <span className="font-semibold text-slate-800">Total Amount:</span>
              <span className="text-2xl font-bold text-orange-600">{formatCurrency(totalAmount)}</span>
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || totalPieces < 1}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-orange-500 bg-white py-3.5 text-base font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiShoppingCart />
              {adding ? 'Adding to cart…' : 'Add to Cart'}
            </button>

            <p className="mt-3 text-center text-sm text-slate-500">
              Same checkout as other products —{' '}
              <Link to="/cart" className="font-medium text-orange-600 hover:underline">
                view cart
              </Link>
            </p>
          </div>
        </div>
      </section>

      <ProductDetailsTabs product={detailProduct} />

      <RelatedProductsSection viewAllHref="/t-shirt-printing">
        {relatedProducts.map((item) => (
          <TShirtProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
