export function formatReviewDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Map API ProductReview documents to ProductDetailsTabs review shape */
export function mapReviewsForDisplay(reviews = []) {
  return reviews.map((review) => ({
    id: review._id || review.id,
    name: review.customerName || 'Customer',
    rating: review.rating || 5,
    date: formatReviewDate(review.createdAt || review.date),
    title: review.title || '',
    comment: review.reviewText || review.comment || '',
    verified: Boolean(review.isVerified ?? review.verified),
    helpful: review.helpful || 0,
  }))
}
