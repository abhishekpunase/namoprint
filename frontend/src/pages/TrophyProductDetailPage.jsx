import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiCalendar,
  FiShoppingCart,
  FiStar,
  FiType,
  FiUploadCloud,
  FiUser,
} from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { TrophyProductCard } from '../components/trophy/TrophyProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductBreadcrumb } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { trophyApi } from '../services/trophyApi'
import { api } from '../services/api'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

function FieldLabel({ icon: Icon, children, required }) {
  return (
    <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
      {children}
      {required && <span className="text-red-500">*</span>}
    </span>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'

export default function TrophyProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addTrophyItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [mainHeading, setMainHeading] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [eventName, setEventName] = useState('')
  const [awardDate, setAwardDate] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  const placeholders = product?.fieldPlaceholders || {}
  const allowLogoUpload = product?.allowLogoUpload !== false
  const frameImage = resolveMediaUrl(product?.images?.[0])

  useEffect(() => {
    trophyApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    if (!product) return
    trophyApi
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

  const total = (selectedOption?.price || 0) * quantity
  const discount = discountPercent(selectedOption?.price, selectedOption?.compareAtPrice)

  const canAddToCart = Boolean(selectedOptionId && mainHeading.trim() && recipientName.trim())

  const uploadLogo = useCallback(
    async (file) => {
      if (!file || !allowLogoUpload) return
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/trophies/${slug}` } })
        return
      }
      setUploading(true)
      setMessage('')
      try {
        const payload = await api.uploadDesign(file)
        const url = payload.asset?.url || payload.asset?.optimizedUrl
        if (url) setLogoUrl(url)
      } catch (err) {
        setMessage(err.message || 'Could not upload logo.')
      } finally {
        setUploading(false)
      }
    },
    [allowLogoUpload, isAuthenticated, navigate, slug],
  )

  if (!product) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">Loading product…</div>
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/trophies/${slug}` } })
      return
    }
    if (!mainHeading.trim() || !recipientName.trim()) {
      setMessage('Please fill main heading and recipient name.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addTrophyItem({
        trophyProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: {
          mainHeading: mainHeading.trim(),
          recipientName: recipientName.trim(),
          eventName: eventName.trim(),
          awardDate,
          organizationName: organizationName.trim(),
          logoUrl,
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
        pathPrefix="/trophies"
        listLabel="Trophies"
        listPath="/trophies"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <ProductBreadcrumb categoryPath="/trophies" categoryLabel="Trophies" productTitle={product.title} className="mb-4" />

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white shadow-sm sm:aspect-square sm:rounded-3xl">
              {frameImage ? (
                <img src={frameImage} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Trophy preview</div>
              )}

              {(mainHeading || recipientName) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center text-white sm:p-5">
                  {mainHeading && <p className="text-lg font-bold uppercase tracking-wide sm:text-xl">{mainHeading}</p>}
                  {recipientName && <p className="mt-2 text-sm font-semibold">{recipientName}</p>}
                  {(eventName || awardDate) && (
                    <p className="mt-1 text-[11px] text-white/70">
                      {[eventName, awardDate].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {organizationName && <p className="mt-0.5 text-[11px] text-white/60">{organizationName}</p>}
                </div>
              )}
            </div>

            {allowLogoUpload && (
              <div className="mt-3">
                <FieldLabel icon={FiUploadCloud}>Upload Logo (optional)</FieldLabel>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 px-3 py-3 text-sm text-slate-700">
                  <FiUploadCloud className="text-orange-500" />
                  {uploading ? 'Uploading…' : logoUrl ? 'Logo uploaded — click to replace' : 'Click to upload logo'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadLogo(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                {logoUrl && (
                  <img src={resolveMediaUrl(logoUrl)} alt="Logo" className="mt-2 h-12 object-contain" />
                )}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{product.title}</h1>
            {product.subtitle && <p className="mt-0.5 text-sm text-slate-500">{product.subtitle}</p>}

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 sm:text-sm">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                ))}
              </div>
              <span className="font-semibold text-slate-800">({product.ratingScore || 4.8})</span>
              <span>• {product.reviewCountLabel || '120+ Reviews'}</span>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-2xl font-extrabold text-orange-600 sm:text-3xl">
                  {formatCurrency(selectedOption?.price || 0)}
                </span>
                {selectedOption?.compareAtPrice > selectedOption?.price && (
                  <span className="text-base text-slate-400 line-through sm:text-lg">
                    {formatCurrency(selectedOption.compareAtPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 sm:text-xs">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
            />

            {product.qualityOptions?.length > 1 && (
              <div className="mt-3">
                <FieldLabel>Size / type</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {product.qualityOptions.map((option) => (
                    <button
                      key={option._id}
                      type="button"
                      onClick={() => setSelectedOptionId(option._id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                        selectedOptionId === option._id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:border-orange-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div>
                <FieldLabel icon={FiType} required>
                  Main Heading
                </FieldLabel>
                <input
                  type="text"
                  value={mainHeading}
                  onChange={(e) => setMainHeading(e.target.value)}
                  placeholder={placeholders.mainHeading || 'e.g. Employee of the Year'}
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel icon={FiUser} required>
                  Recipient / Winner Name
                </FieldLabel>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={placeholders.recipientName || 'Enter winner name'}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <FieldLabel>Event Name</FieldLabel>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder={placeholders.eventName || 'e.g. Annual Awards'}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel icon={FiCalendar}>Award Date</FieldLabel>
                  <input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <FieldLabel>Organization / Company</FieldLabel>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={placeholders.organizationName || 'e.g. Company name'}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Qty
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-sm"
                />
              </label>
              <span className="text-sm font-medium text-slate-700">Total: {formatCurrency(total)}</span>
            </div>

            {message && <p className="mt-2 text-sm text-red-600">{message}</p>}

            <button
              type="button"
              disabled={!canAddToCart || adding}
              onClick={handleAddToCart}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base"
            >
              <FiShoppingCart />
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </section>

      <RelatedProductsSection viewAllHref="/trophies">
        {relatedProducts.map((item) => (
          <TrophyProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
