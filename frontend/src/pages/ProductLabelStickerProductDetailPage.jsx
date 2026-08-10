import { useCallback, useEffect, useState } from 'react'
import { FiShoppingCart, FiUploadCloud } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductLabelStickerProductCard } from '../components/productlabel/ProductLabelStickerProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductBreadcrumb, ProductCategoryBadge } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { api } from '../services/api'
import { productLabelStickerApi } from '../services/productLabelStickerApi'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

export default function ProductLabelStickerProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addProductLabelStickerItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [labelImageUrl, setLabelImageUrl] = useState('')
  const [labelFileName, setLabelFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    productLabelStickerApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    productLabelStickerApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        setRelatedProducts(items.slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug])

  const selectedOption = product?.qualityOptions?.find((o) => o._id === selectedOptionId)
  const total = (selectedOption?.price || 0) * quantity
  const canAddToCart = Boolean(selectedOptionId && labelImageUrl)

  const uploadLabelImage = useCallback(
    async (file) => {
      if (!file) return
      if (!selectedOptionId) {
        setMessage('Please select a label size first.')
        return
      }
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/product-label-stickers/${slug}` } })
        return
      }
      setUploading(true)
      setMessage('')
      try {
        const payload = await api.uploadPhoto(file)
        const url = payload.asset?.url
        if (url) {
          setLabelImageUrl(url)
          setLabelFileName(file.name)
        }
      } catch (err) {
        setMessage(err.message || 'Could not upload label image.')
      } finally {
        setUploading(false)
      }
    },
    [isAuthenticated, navigate, selectedOptionId, slug],
  )

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadLabelImage(file)
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product-label-stickers/${slug}` } })
      return
    }
    if (!selectedOption) {
      setMessage('Please choose a label size.')
      return
    }
    if (!labelImageUrl) {
      setMessage('Please upload your product label image in the selected size.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addProductLabelStickerItem({
        productLabelStickerProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: { labelImageUrl, labelFileName },
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
        pathPrefix="/product-label-stickers"
        listLabel="Product Label Stickers"
        listPath="/product-label-stickers"
        price={selectedOption?.price}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          categoryPath="/product-label-stickers"
          categoryLabel="Product Label Stickers"
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
              {labelImageUrl ? (
                <>
                  <img
                    src={resolveMediaUrl(labelImageUrl)}
                    alt="Label preview"
                    className="mx-auto max-h-40 max-w-full object-contain"
                  />
                  {selectedOption && (
                    <p className="mt-3 text-sm text-orange-300">Size: {selectedOption.label}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-white/60">Select size & upload label artwork to preview</p>
              )}
              <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Label Preview</p>
            </div>
          </div>

          <div>
            <ProductCategoryBadge>Product Labels · Exact Size Print</ProductCategoryBadge>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.title}</h1>
            <ProductDescriptionExpandable
              className="mt-3"
              description={product.description}
              highlights={product.highlights}
              descriptionClassName="text-slate-500"
            />

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Step 1 — Choose label size</p>
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
                        onChange={() => {
                          setSelectedOptionId(option._id)
                          setLabelImageUrl('')
                          setLabelFileName('')
                        }}
                      />
                      {option.label}
                    </span>
                    <span className="font-bold text-orange-600">{formatCurrency(option.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 font-semibold text-slate-800">Step 2 — Upload label image (exact size)</p>
              {selectedOption && (
                <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Your artwork must match <strong>{selectedOption.label}</strong> exactly. We print it as stickers you
                  can peel and apply on your product.
                </p>
              )}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                  dragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-slate-50'
                } ${!selectedOptionId ? 'pointer-events-none opacity-60' : ''}`}
              >
                <FiUploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-sm text-slate-600">
                  Drag & drop your label file or{' '}
                  <label className="cursor-pointer font-semibold text-orange-600 hover:underline">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!selectedOptionId}
                      onChange={(e) => uploadLabelImage(e.target.files?.[0])}
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {product.labelUploadHint ||
                    'PNG or JPG — image dimensions must match the label size you selected'}
                </p>
                {uploading && <p className="mt-2 text-sm text-orange-600">Uploading…</p>}
                {labelFileName && (
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700">
                    ✓ {labelFileName}
                  </p>
                )}
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
                Select a size and upload your label image to enable Add to Cart.
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
              We print your label and ship ready-to-apply stickers — checkout on{' '}
              <Link to="/checkout" className="font-medium text-orange-600 hover:underline">
                checkout page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <RelatedProductsSection viewAllHref="/product-label-stickers">
        {relatedProducts.map((item) => (
          <ProductLabelStickerProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
