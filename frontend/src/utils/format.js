export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export const getProductPrice = (product) => {
  const prices = product?.variants?.map((variant) => variant.price).filter(Number.isFinite) || []
  return prices.length ? Math.min(...prices) : 0
}

export const getCompareAtPrice = (product) => {
  const prices = product?.variants?.map((variant) => variant.compareAtPrice).filter(Number.isFinite) || []
  return prices.length ? Math.min(...prices) : 0
}

export const classNames = (...values) => values.filter(Boolean).join(' ')
