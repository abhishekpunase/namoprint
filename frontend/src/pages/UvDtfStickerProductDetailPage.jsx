import { useCallback, useEffect, useState } from 'react'
import { FiShoppingCart, FiUploadCloud } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { UvDtfStickerProductCard } from '../components/uvdtf/UvDtfStickerProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductBreadcrumb, ProductCategoryBadge } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { api } from '../services/api'
import { uvDtfStickerApi } from '../services/uvDtfStickerApi'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

export default function UvDtfStickerProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addUvDtfStickerItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFileName, setLogoFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    uvDtfStickerApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    uvDtfStickerApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        setRelatedProducts(items.slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug])

  const selectedOption = product?.qualityOptions?.find((o) => o._id === selectedOptionId)
  const total = (selectedOption?.price || 0) * quantity
  const canAddToCart = Boolean(selectedOptionId && logoUrl)

  const uploadLogo = useCallback(
    async (file) => {
      if (!file) return
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/uv-dtf-stickers/${slug}` } })
        return
      }
      setUploading(true)
      setMessage('')
      try {
        const payload = await api.uploadPhoto(file)
        const url = payload.asset?.url
        if (url) {
          setLogoUrl(url)
          setLogoFileName(file.name)
        }
      } catch (err) {
        setMessage(err.message || 'Could not upload logo image.')
      } finally {
        setUploading(false)
      }
    },
    [isAuthenticated, navigate, slug],
  )

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadLogo(file)
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/uv-dtf-stickers/${slug}` } })
      return
    }
    if (!logoUrl) {
      setMessage('Please upload your logo image.')
      return
    }
    if (!selectedOption) {
      setMessage('Please choose a size/option.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addUvDtfStickerItem({
        uvDtfStickerProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: { logoUrl, logoFileName },
      })
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
        pathPrefix="/uv-dtf-stickers"
        listLabel="UV DTF Stickers"
        listPath="/uv-dtf-stickers"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/uv-dtf-stickers"
          categoryLabel="UV DTF Stickers"
          productTitle={product.title}
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-orange-100 bg-neutral-900 shadow-sm lg:aspect-square">
              <img
                src={resolveMediaUrl(product.images?.[activeImage])}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
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

            <div className="mt-6 rounded-3xl border border-dashed border-orange-300 bg-slate-900 p-6 text-center text-white">
              {logoUrl ? (
                <img
                  src={resolveMediaUrl(logoUrl)}
                  alt="Your logo preview"
                  className="mx-auto max-h-32 max-w-full object-contain"
                />
              ) : (
                <p className="text-sm text-white/60">Upload your logo to see preview</p>
              )}
              <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Logo Preview</p>
            </div>
          </div>

          <div>
            <ProductCategoryBadge>UV DTF Stickers · Custom Logo</ProductCategoryBadge>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.title}</h1>
            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
              descriptionClassName="text-slate-500"
            />

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Upload your logo image</p>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                  dragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-slate-50'
                }`}
              >
                <FiUploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-sm text-slate-600">
                  Drag & drop your logo or{' '}
                  <label className="cursor-pointer font-semibold text-orange-600 hover:underline">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadLogo(e.target.files?.[0])}
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {product.logoUploadHint || 'PNG, JPG, SVG — high resolution recommended'}
                </p>
                {uploading && <p className="mt-2 text-sm text-orange-600">Uploading…</p>}
                {logoFileName && (
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700">
                    ✓ {logoFileName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Choose size / pack</p>
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
                <button type="button" className="px-4 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button type="button" className="px-4 py-2" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>
              <span className="ml-auto text-xl font-extrabold text-orange-600">{formatCurrency(total)}</span>
            </div>

            {!canAddToCart && isAuthenticated && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Upload your logo above to enable Add to Cart.
              </p>
            )}

            {message && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || !canAddToCart}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
            >
              <FiShoppingCart />
              {adding ? 'Adding to cart…' : `Add to Cart · ${formatCurrency(total)}`}
            </button>

            <p className="mt-3 text-center text-sm text-slate-500">
              Same checkout as other products — review cart, then pay on{' '}
              <Link to="/checkout" className="font-medium text-orange-600 hover:underline">
                checkout page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <RelatedProductsSection viewAllHref="/uv-dtf-stickers">
        {relatedProducts.map((item) => (
          <UvDtfStickerProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
