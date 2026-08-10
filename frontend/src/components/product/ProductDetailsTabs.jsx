import { useState, useEffect } from 'react'
import {
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiMapPin,
  FiImage as FiImageIcon,
  FiZap,
  FiScissors,
  FiX,
  FiCamera,
  FiThumbsUp,
} from 'react-icons/fi'

/**
 * ProductDetailsTabs
 * <ProductDetailsTabs product={product} reviews={reviews} />
 *
 * product: {
 *   id, title, brand, description, longDescription, heroImageUrl, previewImageUrl,
 *   badges?: string[],
 *   specs?: [{ label, value }],                            // spec sheet (material, size, etc.)
 *   gallery?: string[],                                    // extra photo grid
 * }
 * reviews: [{ id, name, rating, date, title?, comment, verified?, helpful?, avatarUrl? }]
 *
 * If `specs` / `gallery` aren't passed, product-specific placeholder
 * content is generated automatically (using the product's own id/title as a seed)
 * so every product still looks distinct until you wire up real content per product.
 * If you don't pass `reviews`, 4 dummy reviews are used automatically.
 */

const BADGE_ICONS = {
  'made in india': FiMapPin,
  'ready to hang': FiImageIcon,
  'fast delivery': FiZap,
  'free bg removal': FiScissors,
}

// ---- Dummy reviews (used until real data is passed in) --------------------
const DUMMY_REVIEWS = [
  {
    id: 'd1',
    name: 'Anonymous',
    rating: 5,
    date: '15 Apr 2026',
    title: 'Highly recommended',
    comment:
      "Mast product hai bhai, full paisa wasool. Print itna sharp hai ki har koi puchta hai. Highly recommended for gifting.",
    verified: true,
    helpful: 23,
  },
  {
    id: 'd2',
    name: 'Anonymous',
    rating: 5,
    date: '8 Apr 2026',
    title: 'Fast delivery and great packing',
    comment:
      'Superb experience from order to delivery. Got SMS updates regularly, packing bahut better than other sites I tried before.',
    verified: true,
    helpful: 3,
  },
  {
    id: 'd3',
    name: 'Anonymous',
    rating: 4,
    date: '6 Apr 2026',
    title: 'Worth buying',
    comment:
      "Decent quality and the print looks nice. Took about 4 days to deliver. For the price, it's a fair deal. Considering ordering one more for my office desk.",
    verified: true,
    helpful: 5,
  },
  {
    id: 'd4',
    name: 'Anonymous',
    rating: 5,
    date: '2 Apr 2026',
    title: 'Perfect gift idea',
    comment:
      "Gifted this to my parents on their anniversary and they loved it. Colours came out exactly like the preview. Will order again.",
    verified: false,
    helpful: 9,
  },
]

function getFallbackSpecs(product) {
  return [
    { label: 'Material', value: product?.material || 'Premium print stock' },
    { label: 'Finish', value: product?.finish || 'Matte / Glossy' },
    { label: 'Available sizes', value: product?.sizes || 'A4, A3, 12x18", 16x24"' },
    { label: 'Mounting', value: product?.mounting || 'Ready to hang' },
    { label: 'Production time', value: product?.productionTime || '1-2 business days' },
    { label: 'Care', value: product?.care || 'Wipe clean with a dry cloth' },
  ]
}

function getFallbackGallery(product) {
  const seed = product?.id || product?.title || 'product'
  return [1, 2, 3, 4].map((n) => `https://picsum.photos/seed/${seed}-gallery-${n}/500/500`)
}

function Stars({ rating, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`${size} ${
            i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

// Interactive star input used inside the "Write a Review" modal
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1
        const active = hover ? n <= hover : n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <FiStar
              className={`h-7 w-7 transition-colors ${
                active ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

function WriteReviewModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')

  if (!open) return null

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length)
    const urls = files.map((f) => URL.createObjectURL(f))
    setPhotos((prev) => [...prev, ...urls].slice(0, 5))
  }

  const handleSubmit = () => {
    if (!rating) return setError('Please select a rating.')
    if (!name.trim()) return setError('Please enter your name.')
    if (!comment.trim()) return setError('Please write your review.')
    setError('')
    onSubmit({
      id: `local-${Date.now()}`,
      name: name.trim(),
      rating,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: title.trim(),
      comment: comment.trim(),
      verified: false,
      helpful: 0,
    })
    setRating(0)
    setName('')
    setTitle('')
    setComment('')
    setPhotos([])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Write a Review</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Your Rating *</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Review Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/1000</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Add Photos (Optional)</label>
            <p className="mb-2 text-xs text-slate-400">Upload up to 5 photos</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
              {photos.length < 5 && (
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-orange-300 hover:text-orange-400">
                  <FiCamera className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
              )}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}

function RatingBreakdown({ reviews }) {
  const total = reviews.length
  const counts = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => Math.round(r.rating) === star).length)
  return (
    <div className="flex w-full flex-col gap-2">
      {[5, 4, 3, 2, 1].map((star, i) => {
        const count = counts[i]
        const pct = total ? (count / total) * 100 : 0
        return (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="w-10 shrink-0 font-medium text-slate-500">{star} star</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-4 shrink-0 text-right text-slate-400">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ReviewsSection({ reviews, onAddReview }) {
  const [modalOpen, setModalOpen] = useState(false)
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Summary + breakdown */}
      <div className="mb-8 flex flex-col gap-6 border-b border-slate-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</p>
            <Stars rating={avgRating} />
            <p className="mt-1 text-xs text-slate-400">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="w-full sm:max-w-sm">
          <RatingBreakdown reviews={reviews} />
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">All Reviews</h3>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
        >
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                    {review.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-800">
                      {review.name}
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-inset ring-emerald-200">
                          <FiCheckCircle className="h-2.5 w-2.5" /> Verified Purchase
                        </span>
                      )}
                    </p>
                    <Stars rating={review.rating} size="h-3.5 w-3.5" />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{review.date}</span>
              </div>

              {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
              <p className="text-sm leading-relaxed text-slate-600">{review.comment}</p>

              <button
                type="button"
                className="mt-1 flex w-fit items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-orange-500"
              >
                <FiThumbsUp className="h-3.5 w-3.5" />
                Helpful ({review.helpful || 0})
              </button>
            </li>
          ))}
        </ul>
      )}

      <WriteReviewModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onAddReview} />
    </div>
  )
}

export function ProductDetailsTabs({ product, reviews }) {
  const [allReviews, setAllReviews] = useState(() => {
    if (reviews !== undefined) return reviews
    return DUMMY_REVIEWS
  })

  useEffect(() => {
    if (reviews !== undefined) {
      setAllReviews(reviews)
    }
  }, [reviews])

  const badges = product?.badges?.length
    ? product.badges
    : ['Made in India', 'Ready to Hang', 'Fast Delivery', 'Free BG Removal']

  const specs = product?.specs?.length ? product.specs : getFallbackSpecs(product)
  const gallery = product?.gallery?.length ? product.gallery : getFallbackGallery(product)

  const handleAddReview = (newReview) => {
    setAllReviews((prev) => [newReview, ...prev])
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      {/* Trust strip */}
      <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
        {[
          { icon: FiTruck, title: 'Free Shipping', sub: 'On all orders across India', color: 'text-sky-500', bg: 'bg-sky-50' },
          { icon: FiRefreshCw, title: '30-Day Returns', sub: 'Hassle-free guarantee', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { icon: FiShield, title: '100% Secure', sub: 'Encrypted checkout', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map(({ icon: Icon, title, sub, color, bg }) => (
          <div key={title} className="flex flex-col items-center gap-2 bg-white px-6 py-6 text-center">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </span>
            <p className="text-sm font-bold text-slate-800">{title}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Description (no tab switcher — always visible, with reviews right below) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Product Details</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            {product?.brand || 'NAMOPRINT'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image side */}
            <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(120,113,108,0.4), rgba(0,0,0,0.6)), url(' +
                    (product?.heroBgUrl || '') +
                    ')',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative z-10 rotate-[-2deg] rounded-sm border-[10px] border-amber-300/90 bg-white shadow-2xl">
                <img
                  src={product?.previewImageUrl || product?.heroImageUrl}
                  alt={product?.title || 'Product preview'}
                  className="h-64 w-52 object-cover sm:h-80 sm:w-64"
                />
              </div>
            </div>

            {/* Copy side */}
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <span className="text-amber-400">✦</span> Premium Wall Décor by {product?.brand || 'NAMOPRINT'}
              </span>
              <h2 className="text-3xl font-heading leading-tight text-white sm:text-4xl">
                Your photo.
                <br />
                <span className="font-heading italic text-amber-300">Gallery-worthy.</span>
                <br />
                On your wall.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                {product?.description ||
                  'Stop scrolling past your favourite memories. Turn them into a piece of art that demands to be seen — every single day.'}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {badges.map((label) => {
                  const Icon = BADGE_ICONS[label.toLowerCase()] || FiCheckCircle
                  return (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-white/5 px-3 py-1.5 text-xs font-medium text-amber-100"
                    >
                      <Icon className="h-3.5 w-3.5 text-amber-300" />
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {product?.longDescription && (
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {product.longDescription.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* Spec sheet — quick facts about this specific product */}
        {specs.length > 0 && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-6 sm:p-8">
            <h3 className="mb-5 text-lg font-bold text-slate-800">Product Specifications</h3>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <dt className="text-sm text-slate-500">{spec.label}</dt>
                  <dd className="text-sm font-semibold text-slate-800">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Gallery — extra product photos */}
        {gallery.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-5 text-lg font-bold text-slate-800">Gallery</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img src={src} alt={`${product?.title || 'Product'} gallery ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews — always shown right below the description */}
      <ReviewsSection reviews={allReviews} onAddReview={handleAddReview} />
    </section>
  )
}