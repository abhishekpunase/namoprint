import { useContext } from 'react'
import { CartContext } from '../context/CartContextBase'
import { fallbackProducts } from '../data/fallbackCatalog'
import { resolveMediaUrl } from '../utils/mediaUrl'

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}

export function resolveCartProduct(item) {
  if (item?.itemType === 'god' || item?.godProduct) {
    const godProduct = typeof item.godProduct === 'object' ? item.godProduct : null
    return {
      title: godProduct?.title || 'God Photo Frame',
      images: godProduct?.images?.length
        ? godProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (item?.itemType === 'nameplate' || item?.namePlateProduct) {
    const namePlateProduct = typeof item.namePlateProduct === 'object' ? item.namePlateProduct : null
    return {
      title: namePlateProduct?.title || 'Name Plate',
      images: namePlateProduct?.images?.length
        ? namePlateProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (item?.itemType === 'corporategift' || item?.corporateGiftProduct) {
    const corporateGiftProduct = typeof item.corporateGiftProduct === 'object' ? item.corporateGiftProduct : null
    return {
      title: corporateGiftProduct?.title || 'Corporate Gift',
      images: corporateGiftProduct?.images?.length
        ? corporateGiftProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (item?.itemType === 'babybirthframe' || item?.babyBirthFrameProduct) {
    const babyBirthFrameProduct =
      typeof item.babyBirthFrameProduct === 'object' ? item.babyBirthFrameProduct : null
    const photoPreview = item.customization?.photoUrls?.[0] || item.customization?.previewUrl
    return {
      title: babyBirthFrameProduct?.title || 'Baby Birth Frame',
      images: photoPreview
        ? [resolveMediaUrl(photoPreview)]
        : babyBirthFrameProduct?.images?.length
          ? babyBirthFrameProduct.images.map((url) => resolveMediaUrl(url))
          : [],
    }
  }
  if (item?.itemType === 'trophy' || item?.trophyProduct) {
    const trophyProduct = typeof item.trophyProduct === 'object' ? item.trophyProduct : null
    return {
      title: trophyProduct?.title || 'Custom Trophy',
      images: trophyProduct?.images?.length
        ? trophyProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (item?.itemType === 'penprint' || item?.penPrintProduct) {
    const penPrintProduct = typeof item.penPrintProduct === 'object' ? item.penPrintProduct : null
    return {
      title: penPrintProduct?.title || 'Custom Pen Print',
      images: penPrintProduct?.images?.length
        ? penPrintProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (item?.itemType === 'uvdtfsticker' || item?.uvDtfStickerProduct) {
    const uvDtfStickerProduct = typeof item.uvDtfStickerProduct === 'object' ? item.uvDtfStickerProduct : null
    const logoPreview = item.customization?.logoUrl || item.customization?.previewUrl
    return {
      title: uvDtfStickerProduct?.title || 'UV DTF Stickers',
      images: logoPreview
        ? [resolveMediaUrl(logoPreview)]
        : uvDtfStickerProduct?.images?.length
          ? uvDtfStickerProduct.images.map((url) => resolveMediaUrl(url))
          : [],
    }
  }
  if (item?.itemType === 'productlabelsticker' || item?.productLabelStickerProduct) {
    const productLabelStickerProduct =
      typeof item.productLabelStickerProduct === 'object' ? item.productLabelStickerProduct : null
    const labelPreview = item.customization?.labelImageUrl || item.customization?.previewUrl
    return {
      title: productLabelStickerProduct?.title || 'Product Label Stickers',
      images: labelPreview
        ? [resolveMediaUrl(labelPreview)]
        : productLabelStickerProduct?.images?.length
          ? productLabelStickerProduct.images.map((url) => resolveMediaUrl(url))
          : [],
    }
  }
  if (item?.itemType === 'tshirt' || item?.tShirtProduct) {
    const tShirtProduct = typeof item.tShirtProduct === 'object' ? item.tShirtProduct : null
    return {
      title: tShirtProduct?.title || 'Custom T-Shirt',
      images: tShirtProduct?.images?.length
        ? tShirtProduct.images.map((url) => resolveMediaUrl(url))
        : item.customization?.previewUrl
          ? [resolveMediaUrl(item.customization.previewUrl)]
          : [],
    }
  }
  if (typeof item.product === 'object') return item.product
  return fallbackProducts.find((product) => product._id === item.product) || {}
}
