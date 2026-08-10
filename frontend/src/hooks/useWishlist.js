import { useContext } from 'react'
import { WishlistContext } from '../context/WishlistContextBase'

export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
