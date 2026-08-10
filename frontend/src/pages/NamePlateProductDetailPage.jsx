import { useEffect, useState } from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { namePlateApi } from '../services/namePlateApi'
import { NamePlateProductCard } from '../components/nameplate/NamePlateProductCard'
import { RelatedProductsSection } from '../components/product/RelatedProductsSection'
import { ProductBreadcrumb, ProductCategoryBadge } from '../components/product/ProductBreadcrumb'
import { ProductDescriptionExpandable } from '../components/product/ProductDescriptionExpandable'
import { ProductPageSeo } from '../components/seo/ProductPageSeo'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { resolveMediaUrl } from '../utils/mediaUrl'

export default function NamePlateProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addNamePlateItem } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [headingText, setHeadingText] = useState('')
  const [subText, setSubText] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    namePlateApi
      .get(slug)
      .then((payload) => {
        setProduct(payload.product)
        setSelectedOptionId(payload.product?.qualityOptions?.[0]?._id || '')
      })
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    namePlateApi
      .list()
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.slug !== slug)
        setRelatedProducts(items.slice(0, 4))
      })
      .catch(() => setRelatedProducts([]))
  }, [slug])

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Loading product…</div>
  }

  const selectedOption = product.qualityOptions.find((o) => o._id === selectedOptionId)
  const total = (selectedOption?.price || 0) * quantity
  const canAddToCart = Boolean(selectedOptionId && headingText.trim() && subText.trim())

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/name-plates/${slug}` } })
      return
    }
    if (!selectedOption) {
      setMessage('Please choose a size/quality option.')
      return
    }
    if (!headingText.trim() || !subText.trim()) {
      setMessage('Please enter both name and address for the name plate.')
      return
    }

    setAdding(true)
    setMessage('')
    try {
      await addNamePlateItem({
        namePlateProduct: product,
        qualityOption: selectedOption,
        quantity,
        customization: {
          headingText: headingText.trim(),
          subText: subText.trim(),
        },
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
        pathPrefix="/name-plates"
        listLabel="Name Plates"
        listPath="/name-plates"
        price={selectedOption?.price}
      />
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductBreadcrumb
        categoryPath="/name-plates"
        categoryLabel="Name Plates"
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

          <div className="mt-6 rounded-3xl border border-dashed border-orange-300 bg-slate-900 p-8 text-center text-white">
            <p className="text-2xl font-bold tracking-wide">{headingText || product.headingPlaceholder || 'Your name'}</p>
            {(subText || product.subTextPlaceholder) && (
              <p className="mt-2 text-sm text-orange-300">{subText || product.subTextPlaceholder || 'Your address'}</p>
            )}
            <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Preview</p>
          </div>
        </div>

        <div>
          <ProductCategoryBadge>Name Plate · Custom Text</ProductCategoryBadge>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.title}</h1>
          <ProductDescriptionExpandable
            className="mt-3"
            description={product.description}
            highlights={product.highlights}
            descriptionClassName="text-slate-500"
          />

          <div className="mt-6 space-y-3 rounded-3xl border border-orange-100 bg-orange-50/40 p-6">
            <p className="font-semibold text-slate-800">What should we write on your name plate?</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Name</label>
              <input
                required
                placeholder={product.headingPlaceholder || 'Enter your name'}
                value={headingText}
                onChange={(e) => setHeadingText(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Address</label>
              <input
                required
                placeholder={product.subTextPlaceholder || 'Enter your address'}
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5"
              />
            </div>
          </div>

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
              Enter name and address above to enable Add to Cart.
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

      <RelatedProductsSection viewAllHref="/name-plates">
        {relatedProducts.map((item) => (
          <NamePlateProductCard key={item._id} product={item} />
        ))}
      </RelatedProductsSection>
    </>
  )
}
