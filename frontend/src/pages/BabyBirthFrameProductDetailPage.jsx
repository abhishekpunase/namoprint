import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiCalendar,
  FiClock,
  FiHeart,
  FiImage,
  FiMapPin,
  FiShoppingCart,
  FiStar,
  FiUploadCloud,
  FiUsers,
} from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { BabyBirthFrameProductCard } from '../components/babybirthframe/BabyBirthFrameProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductBreadcrumb } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { babyBirthFrameApi } from '../services/babyBirthFrameApi'
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

export default function BabyBirthFrameProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addBabyBirthFrameItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [gender, setGender] = useState('')
  const [babyName, setBabyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [hospital, setHospital] = useState('')
  const [proudParents, setProudParents] = useState('')
  const [photoUrls, setPhotoUrls] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  const placeholders = product?.fieldPlaceholders || {}
  const maxPhotos = Math.max(1, product?.maxPhotos || 3)
  const genderOptions = product?.genderOptions?.length ? product.genderOptions : ['Boy', 'Girl']

  useEffect(() => {
    babyBirthFrameApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
        setGender(payload.product?.genderOptions?.[0] || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    if (!product) return
    babyBirthFrameApi
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
  const previewPhoto = photoUrls[0] ? resolveMediaUrl(photoUrls[0]) : ''
  const frameImage = resolveMediaUrl(product?.images?.[0])

  const canAddToCart = Boolean(
    selectedOptionId && gender && babyName.trim() && birthDate && photoUrls.length > 0,
  )

  const uploadPhoto = useCallback(
    async (file) => {
      if (!file) return
      if (photoUrls.length >= maxPhotos) {
        setMessage(`Maximum ${maxPhotos} photo(s) allowed.`)
        return
      }
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/baby-birth-frames/${slug}` } })
        return
      }
      setUploading(true)
      setMessage('')
      try {
        const payload = await api.uploadPhoto(file)
        const url = payload.asset?.url || payload.asset?.optimizedUrl
        if (url) setPhotoUrls((prev) => [...prev, url])
      } catch (err) {
        setMessage(err.message || 'Could not upload photo.')
      } finally {
        setUploading(false)
      }
    },
    [isAuthenticated, maxPhotos, navigate, photoUrls.length, slug],
  )

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const files = Array.from(event.dataTransfer.files || [])
    files.slice(0, maxPhotos - photoUrls.length).forEach((file) => uploadPhoto(file))
  }

  const removePhoto = (index) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index))
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">Loading product…</div>
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/baby-birth-frames/${slug}` } })
      return
    }
    if (!gender) {
      setMessage('Please select gender.')
      return
    }
    if (!babyName.trim()) {
      setMessage("Please enter baby's name.")
      return
    }
    if (!birthDate) {
      setMessage('Please enter birth date.')
      return
    }
    if (!photoUrls.length) {
      setMessage("Please upload baby's photo.")
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addBabyBirthFrameItem({
        babyBirthFrameProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: {
          gender,
          babyName: babyName.trim(),
          birthDate,
          birthTime: birthTime.trim(),
          weight: weight.trim(),
          height: height.trim(),
          hospital: hospital.trim(),
          proudParents: proudParents.trim(),
          photoUrls,
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
        pathPrefix="/baby-birth-frames"
        listLabel="Baby Birth Frames"
        listPath="/baby-birth-frames"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/baby-birth-frames"
          categoryLabel="Baby Birth Frames"
          productTitle={product.title}
          className="mb-4"
        />

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          {/* Left — product image + upload */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 shadow-sm sm:aspect-square sm:rounded-3xl">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Baby preview" className="h-full w-full object-cover" />
              ) : frameImage ? (
                <img src={frameImage} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-slate-400">
                  <FiImage className="h-10 w-10" />
                  <p className="text-center text-xs sm:text-sm">Upload baby&apos;s photo to see preview</p>
                </div>
              )}

              {(babyName || birthDate) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white sm:p-5">
                  {babyName && <p className="text-lg font-bold sm:text-xl">{babyName}</p>}
                  {birthDate && (
                    <p className="mt-0.5 text-xs text-white/90 sm:text-sm">
                      Born {birthDate}
                      {birthTime ? ` · ${birthTime}` : ''}
                    </p>
                  )}
                  {(weight || height) && (
                    <p className="mt-0.5 text-[11px] text-white/80 sm:text-xs">
                      {[weight, height].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Upload — directly below product image */}
            <div>
              <FieldLabel icon={FiUploadCloud} required>
                Upload Baby&apos;s Photo
              </FieldLabel>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-xl border-2 border-dashed px-3 py-4 text-center transition sm:px-4 sm:py-5 ${
                  dragOver ? 'border-orange-500 bg-orange-50' : 'border-orange-300 bg-orange-50/40'
                }`}
              >
                <FiUploadCloud className="mx-auto h-6 w-6 text-orange-500 sm:h-7 sm:w-7" />
                <p className="mt-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                  {uploading ? 'Uploading…' : `Click to upload (Max ${maxPhotos} images)`}
                </p>
                <label className="mt-2 inline-block cursor-pointer rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 sm:text-sm">
                  Choose files
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    disabled={uploading || photoUrls.length >= maxPhotos}
                    onChange={(e) => {
                      Array.from(e.target.files || [])
                        .slice(0, maxPhotos - photoUrls.length)
                        .forEach((file) => uploadPhoto(file))
                      e.target.value = ''
                    }}
                  />
                </label>
                {photoUrls.length > 0 && (
                  <p className="mt-1.5 text-[11px] text-green-600 sm:text-xs">{photoUrls.length} photo(s) uploaded</p>
                )}
              </div>

              {photoUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photoUrls.map((url, index) => (
                    <div key={url + index} className="relative">
                      <img
                        src={resolveMediaUrl(url)}
                        alt=""
                        className="h-14 w-14 rounded-lg border-2 border-orange-300 object-cover sm:h-16 sm:w-16"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — info + form */}
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
              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">Inclusive of all taxes</p>
            </div>

            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
            />

            {product.qualityOptions?.length > 1 && (
              <div className="mt-3">
                <FieldLabel>Size / quality</FieldLabel>
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
                <FieldLabel required>Gender</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition sm:text-sm ${
                        gender === option
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={gender === option}
                        onChange={() => setGender(option)}
                        className="sr-only"
                      />
                      <span>{option === 'Boy' ? '👦' : option === 'Girl' ? '👧' : '👶'}</span>
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel icon={FiHeart} required>
                  Baby&apos;s Name
                </FieldLabel>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder={placeholders.babyName || "Enter baby's name"}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <FieldLabel icon={FiCalendar} required>
                    Birth Date
                  </FieldLabel>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel icon={FiClock}>Birth Time</FieldLabel>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <FieldLabel>Weight (kg)</FieldLabel>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={placeholders.weight || 'e.g., 3.2 kg'}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Height (cm)</FieldLabel>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={placeholders.height || 'e.g., 50 cm'}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <FieldLabel icon={FiMapPin}>Hospital / Birth Place</FieldLabel>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder={placeholders.hospital || 'Enter hospital name'}
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel icon={FiUsers}>Proud Parents</FieldLabel>
                <input
                  type="text"
                  value={proudParents}
                  onChange={(e) => setProudParents(e.target.value)}
                  placeholder={placeholders.proudParents || 'e.g., Mom & Dad Name'}
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

      <RelatedProductsSection viewAllHref="/baby-birth-frames">
        {relatedProducts.map((item) => (
          <BabyBirthFrameProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
