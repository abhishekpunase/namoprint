import { useEffect, useMemo, useState } from 'react'
import {
  FiLock,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiAlertCircle,
} from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductFrameGallery } from '../components/product/ProductFrameGallery'
import { PhotoAdjustPanel } from '../components/product/PhotoAdjustPanel'
import { ProductCard } from '../components/product/ProductCard'
import { ProductDetailsTabs } from '../components/product/ProductDetailsTabs'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { WallWatchProductCard } from '../components/wallwatch/WallWatchProductCard'
import { ProductBreadcrumb, ProductCategoryBadge } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useDesign } from '../hooks/useDesign'
import { fallbackProducts, getProductImage, getProductBaseImage } from '../data/fallbackCatalog'
import { getDefaultOptions } from '../data/customizationTemplates'
import { findMatchingVariant, getProductFramePresets } from '../data/productFrameGallery'
import { getRequiredPhotoSlotCount } from '../data/collageFrameMockup'
import { enrichProductMockup } from '../utils/enrichProductMockup'
import { composeAndUploadDesignPreview } from '../utils/composeDesignPreview'
import { usesLiveProductImage } from '../data/fallbackCatalog'
import { api } from '../services/api'
import { formatCurrency } from '../utils/format'
import { getDedicatedListingPath } from '../config/categoryRoutes'
import { isWallWatchProduct, filterWallWatchProducts } from '../utils/wallWatchCatalog'

const formatFieldLabel = (field) =>
  field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()

const DEFAULT_CROP = { x: 0, y: 0, scale: 1, rotate: 0 }

export function ProductDesignerPage({
  catalogBase = '/products',
  catalogLabel = 'Products',
} = {}) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const productPath = `${catalogBase}/${slug}`
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { design, uploadPhoto, setCrop, setText, setNotes } = useDesign()
  const [product, setProduct] = useState(() => fallbackProducts.find((item) => item.slug === slug))
  const [mockupLoading, setMockupLoading] = useState(false)
  const [variantId, setVariantId] = useState(product?.variants?.[0]?._id || '')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState(() => ({
    ...getDefaultOptions(product?.productType, product),
    ...product?.defaultOptions,
  }))
  const [activeSlot, setActiveSlot] = useState(0)
  const [slotPhotos, setSlotPhotos] = useState([])
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [previewState, setPreviewState] = useState({})
  const [galleryPhotoUrl, setGalleryPhotoUrl] = useState(null)
  const [activePresetId, setActivePresetId] = useState(null)

  const framePresets = useMemo(() => getProductFramePresets(product), [product])

  useEffect(() => {
    if (!framePresets.length) return
    const first = framePresets[0]
    setActivePresetId(first.id)
    setGalleryPhotoUrl(null)
    setSelectedOptions((current) => ({ ...current, ...first.options }))
    const matched = findMatchingVariant(product, first)
    if (matched?._id) setVariantId(matched._id)
  }, [product?.slug])

  const handlePresetSelect = (preset) => {
    setActivePresetId(preset.id)
    setSelectedOptions((current) => ({ ...current, ...preset.options }))
    const matched = findMatchingVariant(product, preset)
    if (matched?._id) setVariantId(matched._id)
  }

  const displayPhotoUrl = design.photoUrl || galleryPhotoUrl
  const activeCrop = useMemo(() => {
    const slotCrop = slotPhotos[activeSlot]?.crop
    if (slotCrop) return { ...DEFAULT_CROP, ...slotCrop }
    if (activeSlot === 0) return { ...DEFAULT_CROP, ...design.crop }
    return DEFAULT_CROP
  }, [activeSlot, slotPhotos, design.crop])

  useEffect(() => {
    setMockupLoading(true)
    api
      .product(slug)
      .then(async (payload) => {
        const enriched = await enrichProductMockup(payload.product)
        setProduct(enriched)
        setVariantId(enriched.variants?.[0]?._id || '')
        setSelectedOptions({ ...getDefaultOptions(enriched.productType, enriched), ...enriched.defaultOptions })
        setSlotPhotos([])
        setActiveSlot(0)
      })
      .catch(async () => {
        const fallback = fallbackProducts.find((item) => item.slug === slug)
        const enriched = fallback ? await enrichProductMockup(fallback) : fallback
        setProduct(enriched)
        setVariantId(enriched?.variants?.[0]?._id || '')
        setSelectedOptions({ ...getDefaultOptions(enriched?.productType, enriched), ...enriched?.defaultOptions })
        setSlotPhotos([])
        setActiveSlot(0)
      })
      .finally(() => setMockupLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product?._id && !product?.slug) return
    api
      .productReviews?.(slug)
      .then((payload) => setReviews(payload?.reviews || []))
      .catch(() => setReviews(product?.reviews || []))
  }, [slug, product?._id])

  useEffect(() => {
    if (!product?.productType) return

    const loadRelated = async () => {
      try {
        const payload = await api.products('')
        const merged = payload.items?.length ? payload.items : fallbackProducts
        let items = merged.filter((item) => item.slug !== slug)

        if (isWallWatchProduct(product)) {
          items = filterWallWatchProducts(items)
        } else {
          items = items.filter((item) => item.productType === product.productType)
        }

        setRelatedProducts(items.slice(0, 4))
      } catch {
        let items = fallbackProducts.filter((item) => item.slug !== slug)
        if (isWallWatchProduct(product)) {
          items = filterWallWatchProducts(items)
        } else {
          items = items.filter((item) => item.productType === product.productType)
        }
        setRelatedProducts(items.slice(0, 4))
      }
    }

    loadRelated()
  }, [product, slug])

  useEffect(() => {
    if (!product?.slug || catalogBase !== '/products') return
    const dedicatedBase = getDedicatedListingPath(product.productType)
    if (dedicatedBase) {
      navigate(`${dedicatedBase}/${product.slug}`, { replace: true })
    }
  }, [product, catalogBase, navigate])

  const variant = useMemo(
    () => product?.variants?.find((item) => item._id === variantId) || product?.variants?.[0],
    [product, variantId],
  )

  if (!product) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <FiAlertCircle className="h-10 w-10 text-rose-400" />
          <p className="text-lg font-semibold text-slate-700">Product not found.</p>
        </div>
      </section>
    )
  }

  const requiredSlots = getRequiredPhotoSlotCount(product, variant, selectedOptions)

  const handleCropChange = (nextCrop, slotIndex = activeSlot) => {
    setActiveSlot(slotIndex)

    const mergeCrop = (prev) => ({ ...DEFAULT_CROP, ...prev, ...nextCrop })

    setSlotPhotos((current) => {
      const next = [...current]
      while (next.length <= slotIndex) {
        next.push({})
      }
      const prevCrop =
        next[slotIndex]?.crop || (slotIndex === 0 ? design.crop : DEFAULT_CROP)
      next[slotIndex] = {
        ...next[slotIndex],
        crop: mergeCrop(prevCrop),
      }
      return next
    })

    if (slotIndex === 0) {
      setCrop(mergeCrop(design.crop))
    }
  }

  const uploadSlotPhoto = async (file, slotIndex = 0) => {
    setActiveSlot(slotIndex)
    try {
      const asset = await uploadPhoto(file)
      setSlotPhotos((current) => {
        const next = [...current]
        next[slotIndex] = {
          assetId: asset._id,
          url: asset.previewUrl || URL.createObjectURL(file),
        }
        return next
      })
    } catch {
      setSlotPhotos((current) => {
        const next = [...current]
        next[slotIndex] = {
          url: URL.createObjectURL(file),
        }
        return next
      })
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: productPath } })
      return
    }

    const requiredTextFields = (product.personalization?.allowText
      ? product.personalization.textFields || ['caption']
      : []
    ).filter((field) => !String(design.text?.[field] || '').trim())

    if (requiredTextFields.length) {
      setMessage(`Please fill in: ${requiredTextFields.map(formatFieldLabel).join(', ')}`)
      return
    }

    const needsPhotos = product.personalization?.allowPhotoUpload !== false && requiredSlots > 0
    const uploadedCount = slotPhotos.filter((photo) => photo?.assetId || photo?.url).length
    const hasSinglePhoto = Boolean(design.asset || design.photoUrl)
    if (needsPhotos && uploadedCount < requiredSlots && !(requiredSlots === 1 && hasSinglePhoto)) {
      setMessage(`Please upload ${requiredSlots} photo${requiredSlots > 1 ? 's' : ''} before adding to cart.`)
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const uploadedSlotPhotos = slotPhotos
        .map((photo, index) =>
          photo?.assetId
            ? {
                asset: photo.assetId,
                crop: photo.crop || design.crop,
                placement: `slot-${index + 1}`,
              }
            : null,
        )
        .filter(Boolean)

      const hasUploadedPhotos = Boolean(
        uploadedSlotPhotos.length || design.asset || slotPhotos.some((photo) => photo?.url) || design.photoUrl,
      )

      let composedDesignUrl = ''
      const skipDesignCompose = usesLiveProductImage(product)

      if (hasUploadedPhotos && !skipDesignCompose) {
        composedDesignUrl = await composeAndUploadDesignPreview(
          {
            product,
            variant,
            options: selectedOptions,
            slotPhotos,
            design,
            photoUrl: displayPhotoUrl,
            frameColor: previewState.frameColor,
            frameThicknessPx: previewState.thicknessPx,
          },
          (file) => api.uploadPhoto(file),
        )
      }

      const fallbackPreview =
        design.photoUrl ||
        slotPhotos.find((photo) => photo?.url)?.url ||
        (skipDesignCompose ? getProductBaseImage(product) || product?.images?.[0] : '') ||
        ''
      const previewUrl = composedDesignUrl || fallbackPreview

      await addItem({
        product,
        variant,
        quantity,
        customization: {
          photos: design.asset && !uploadedSlotPhotos.length ? [{ asset: design.asset._id, crop: design.crop, placement: 'front' }] : [],
          text: design.text,
          notes: design.notes,
          options: selectedOptions,
          slotPhotos: uploadedSlotPhotos,
          previewUrl,
          designImageUrl: previewUrl,
          frameColor: previewState.frameColor,
          frameColorName: previewState.frameColorName,
          thickness: previewState.thickness,
          orientation: previewState.orientation,
          size: previewState.size,
          canvasText: previewState.textItems,
        },
      })
      navigate('/cart')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const textFields = product.personalization?.allowText
    ? product.personalization.textFields || ['caption']
    : []
  const allowPhotoUpload = product.personalization?.allowPhotoUpload !== false

  const missingTextFields = textFields.filter((field) => !String(design.text?.[field] || '').trim())
  const hasRequiredPhotos = !allowPhotoUpload || requiredSlots <= 0 || Boolean(
    slotPhotos.filter((photo) => photo?.assetId || photo?.url).length >= requiredSlots ||
      (requiredSlots === 1 && (design.asset || design.photoUrl)),
  )
  const canAddToCart = missingTextFields.length === 0 && hasRequiredPhotos && Boolean(variant?._id)

  return (
    <>
      <ProductPageSeo
        product={product}
        pathPrefix={catalogBase}
        listLabel={catalogLabel}
        listPath={catalogBase}
        price={variant?.price}
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <ProductBreadcrumb categoryPath={catalogBase} productTitle={product.title} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Left — preview + photo adjust */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-amber-50 p-2 shadow-md sm:p-5 overflow-x-clip">
            {mockupLoading ? (
              <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
                Detecting photo slots from mockup frame…
              </div>
            ) : (
              <ProductFrameGallery
              product={product}
              variant={variant}
              presets={framePresets}
              activePresetId={activePresetId}
              onSelectPreset={handlePresetSelect}
              photoUrl={displayPhotoUrl}
              crop={design.crop}
              text={design.text}
              options={selectedOptions}
              slotPhotos={slotPhotos}
              activeSlot={activeSlot}
              onPhotoSelect={uploadSlotPhoto}
              onCropChange={handleCropChange}
              onSlotActivate={setActiveSlot}
              onPreviewChange={setPreviewState}
              onOptionChange={(key, value) => setSelectedOptions((current) => ({ ...current, [key]: value }))}
            />
            )}
          </div>

          <PhotoAdjustPanel
            crop={activeCrop}
            activeSlotIndex={activeSlot}
            slotCount={requiredSlots}
            onCropChange={(nextCrop) => handleCropChange(nextCrop, activeSlot)}
            textFields={textFields}
            text={design.text}
            onTextChange={setText}
            showPhotoControls={allowPhotoUpload}
          />
        </div>

        {/* Right — product info (e-commerce style) */}
        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-md sm:p-7">
          <div>
            <ProductCategoryBadge>
              {product.productType.replaceAll('-', ' ')}
            </ProductCategoryBadge>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl font-bold text-orange-600">{formatCurrency(variant?.price || 0)}</strong>
              {variant?.compareAtPrice > variant?.price && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(variant.compareAtPrice)}</span>
              )}
            </div>
            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
              descriptionClassName="text-sm leading-relaxed text-slate-600 sm:text-base"
              highlightVariant="pills"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Select variant</label>
            <select
              value={variantId}
              onChange={(event) => setVariantId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              {product.variants?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.size} - {item.material}
                  {item.frameType ? ` - ${item.frameType}` : ''} - {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </div>


          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                >
                  <FiMinus />
                </button>
                <strong className="min-w-[2rem] text-center text-lg text-slate-900">{quantity}</strong>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <strong className="text-2xl font-bold text-orange-600">
                {formatCurrency((variant?.price || 0) * quantity)}
              </strong>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Design notes (optional)</label>
            <textarea
              value={design.notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Any print instructions..."
              rows={2}
              className="resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {!canAddToCart && isAuthenticated && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">
              {missingTextFields.length > 0
                ? `Fill in custom text: ${missingTextFields.map(formatFieldLabel).join(', ')}`
                : `Upload ${requiredSlots} photo${requiredSlots > 1 ? 's' : ''} to continue`}
            </p>
          )}

          {message && (
            <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600">
              <FiAlertCircle className="h-4 w-4 shrink-0" /> {message}
            </p>
          )}

          {!isAuthenticated && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-700">
              <FiLock className="h-4 w-4 shrink-0" />
              Login required to add to cart.{' '}
              <Link to="/login" state={{ from: productPath }} className="font-semibold underline underline-offset-2">
                Login now
              </Link>
            </p>
          )}

          <button
            type="button"
            disabled={submitting || !canAddToCart}
            onClick={() => handleAddToCart().catch((error) => setMessage(error.message))}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiShoppingCart className="h-5 w-5" />
            {submitting ? 'Adding...' : 'Add to cart'}
          </button>
        </div>
        </div>
      </section>

      {/* Description + Reviews */}
      <ProductDetailsTabs
        product={{
          title: product.title,
          description: product.description,
          heroImageUrl: design.photoUrl || getProductImage(product),
          previewImageUrl: design.photoUrl || getProductImage(product),
          brand: product.brand || 'NAMO PRINT',
          badges: product.badges,
          longDescription: product.longDescription,
        }}
        reviews={reviews}
      />

      <RelatedProductsSection
        viewAllHref={
          getDedicatedListingPath(product.productType) ||
          `/products?type=${encodeURIComponent(product.productType)}`
        }
      >
        {relatedProducts.map((item) =>
          isWallWatchProduct(product) ? (
            <WallWatchProductCard key={item._id || item.slug} product={item} />
          ) : (
            <ProductCard key={item._id || item.slug} product={item} />
          ),
        )}
      </RelatedProductsSection>
    </>
  )
}