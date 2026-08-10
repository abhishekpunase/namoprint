import { useCallback, useMemo, useRef, useState } from 'react'
import { WishlistContext } from './WishlistContextBase'

const STORAGE_KEY = 'namo_wishlist'

function loadWishlist() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(parsed?.items) ? parsed : { items: [] }
  } catch {
    return { items: [] }
  }
}

export function getWishlistKey(product) {
  return String(product?.slug || product?._id || '')
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(loadWishlist)
  const wishlistRef = useRef(wishlist)
  wishlistRef.current = wishlist

  const persist = useCallback((nextWishlist) => {
    wishlistRef.current = nextWishlist
    setWishlist(nextWishlist)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWishlist))
  }, [])

  const isWishlisted = useCallback((productOrSlug) => {
    const key = typeof productOrSlug === 'string' ? productOrSlug : getWishlistKey(productOrSlug)
    if (!key) return false
    return (wishlistRef.current.items || []).some((item) => item.key === key)
  }, [])

  const addItem = useCallback(
    (product) => {
      const key = getWishlistKey(product)
      if (!key) return wishlistRef.current

      const current = wishlistRef.current.items || []
      if (current.some((item) => item.key === key)) return wishlistRef.current

      const next = {
        items: [
          ...current,
          {
            key,
            product,
            addedAt: Date.now(),
          },
        ],
      }
      persist(next)
      return next
    },
    [persist],
  )

  const removeItem = useCallback(
    (productOrSlug) => {
      const key = typeof productOrSlug === 'string' ? productOrSlug : getWishlistKey(productOrSlug)
      if (!key) return wishlistRef.current

      const next = {
        items: (wishlistRef.current.items || []).filter((item) => item.key !== key),
      }
      persist(next)
      return next
    },
    [persist],
  )

  const toggleItem = useCallback(
    (product) => {
      if (isWishlisted(product)) {
        return removeItem(product)
      }
      return addItem(product)
    },
    [addItem, isWishlisted, removeItem],
  )

  const clear = useCallback(() => {
    persist({ items: [] })
  }, [persist])

  const count = wishlist.items?.length || 0

  const value = useMemo(
    () => ({
      wishlist,
      items: wishlist.items || [],
      count,
      isWishlisted,
      addItem,
      removeItem,
      toggleItem,
      clear,
    }),
    [wishlist, count, isWishlisted, addItem, removeItem, toggleItem, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
