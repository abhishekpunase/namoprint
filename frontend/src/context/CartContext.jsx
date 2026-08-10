import { useCallback, useMemo, useRef, useState } from 'react'
import { CartContext } from './CartContextBase'
import { api } from '../services/api'

const fallbackCart = () => {
  try {
    return JSON.parse(localStorage.getItem('omgs_cart')) || { items: [] }
  } catch {
    return { items: [] }
  }
}

const isDemoProductId = (id) => !id || String(id).startsWith('demo-') || String(id).startsWith('local-')

const matchServerVariant = (serverProduct, selectedVariant) => {
  if (!serverProduct?.variants?.length) return selectedVariant
  const byId = serverProduct.variants.find((item) => item._id === selectedVariant?._id)
  if (byId) return byId
  const bySku = serverProduct.variants.find((item) => item.sku && item.sku === selectedVariant?.sku)
  if (bySku) return bySku
  const bySize = serverProduct.variants.find(
    (item) =>
      item.size === selectedVariant?.size &&
      item.material === selectedVariant?.material &&
      (item.frameType || '') === (selectedVariant?.frameType || ''),
  )
  return bySize || serverProduct.variants[0]
}

const resolveServerProduct = async (product, variant) => {
  if (!isDemoProductId(product?._id) || !product?.slug) {
    return { product, variant }
  }

  const payload = await api.product(product.slug)
  const serverProduct = payload?.product
  if (!serverProduct?._id) {
    throw new Error(
      'This product could not be loaded from the server. Go to Products, open the item again, and add to cart.',
    )
  }

  return {
    product: serverProduct,
    variant: matchServerVariant(serverProduct, variant),
  }
}

const isGodCartItem = (item) => item?.itemType === 'god' || item?.godProduct
const isNamePlateCartItem = (item) => item?.itemType === 'nameplate' || item?.namePlateProduct
const isCorporateGiftCartItem = (item) => item?.itemType === 'corporategift' || item?.corporateGiftProduct
const isBabyBirthFrameCartItem = (item) => item?.itemType === 'babybirthframe' || item?.babyBirthFrameProduct
const isTrophyCartItem = (item) => item?.itemType === 'trophy' || item?.trophyProduct
const isPenPrintCartItem = (item) => item?.itemType === 'penprint' || item?.penPrintProduct
const isUvDtfStickerCartItem = (item) => item?.itemType === 'uvdtfsticker' || item?.uvDtfStickerProduct
const isProductLabelStickerCartItem = (item) =>
  item?.itemType === 'productlabelsticker' || item?.productLabelStickerProduct
const isTShirtCartItem = (item) => item?.itemType === 'tshirt' || item?.tShirtProduct
const isSpecialCartItem = (item) =>
  isGodCartItem(item) ||
  isNamePlateCartItem(item) ||
  isCorporateGiftCartItem(item) ||
  isBabyBirthFrameCartItem(item) ||
  isTrophyCartItem(item) ||
  isPenPrintCartItem(item) ||
  isUvDtfStickerCartItem(item) ||
  isProductLabelStickerCartItem(item) ||
  isTShirtCartItem(item)

const sumSizeQuantities = (sizeQuantities = {}) =>
  Object.values(sizeQuantities).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)

const toSyncPayload = (items = []) =>
  items
    .map((item) => {
      if (isGodCartItem(item)) {
        const godProductId = typeof item.godProduct === 'object' ? item.godProduct?._id : item.godProduct
        return {
          godProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
        }
      }
      if (isNamePlateCartItem(item)) {
        const namePlateProductId =
          typeof item.namePlateProduct === 'object' ? item.namePlateProduct?._id : item.namePlateProduct
        return {
          namePlateProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isCorporateGiftCartItem(item)) {
        const corporateGiftProductId =
          typeof item.corporateGiftProduct === 'object' ? item.corporateGiftProduct?._id : item.corporateGiftProduct
        return {
          corporateGiftProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isBabyBirthFrameCartItem(item)) {
        const babyBirthFrameProductId =
          typeof item.babyBirthFrameProduct === 'object'
            ? item.babyBirthFrameProduct?._id
            : item.babyBirthFrameProduct
        return {
          babyBirthFrameProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isTrophyCartItem(item)) {
        const trophyProductId =
          typeof item.trophyProduct === 'object' ? item.trophyProduct?._id : item.trophyProduct
        return {
          trophyProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isPenPrintCartItem(item)) {
        const penPrintProductId =
          typeof item.penPrintProduct === 'object' ? item.penPrintProduct?._id : item.penPrintProduct
        return {
          penPrintProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isUvDtfStickerCartItem(item)) {
        const uvDtfStickerProductId =
          typeof item.uvDtfStickerProduct === 'object' ? item.uvDtfStickerProduct?._id : item.uvDtfStickerProduct
        return {
          uvDtfStickerProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isProductLabelStickerCartItem(item)) {
        const productLabelStickerProductId =
          typeof item.productLabelStickerProduct === 'object'
            ? item.productLabelStickerProduct?._id
            : item.productLabelStickerProduct
        return {
          productLabelStickerProductId,
          qualityOptionId: String(item.qualityOptionId || ''),
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      if (isTShirtCartItem(item)) {
        const tShirtProductId =
          typeof item.tShirtProduct === 'object' ? item.tShirtProduct?._id : item.tShirtProduct
        return {
          tShirtProductId,
          quantity: item.quantity,
          customization: item.customization || {},
        }
      }
      const customization = item.customization || {}
      const productRef = typeof item.product === 'object' ? item.product : null
      return {
        productId: productRef?._id || item.product,
        variantId: String(item.variantId || ''),
        quantity: item.quantity,
        customization: {
          ...customization,
          variantSku: customization.variantSku || productRef?.variants?.find((v) => String(v._id) === String(item.variantId))?.sku,
          size: customization.size || productRef?.variants?.find((v) => String(v._id) === String(item.variantId))?.size,
          material: customization.material || productRef?.variants?.find((v) => String(v._id) === String(item.variantId))?.material,
          frameType: customization.frameType || productRef?.variants?.find((v) => String(v._id) === String(item.variantId))?.frameType,
        },
      }
    })
    .filter((item) => {
      if (item.godProductId) {
        return !isDemoProductId(item.godProductId) && item.qualityOptionId
      }
      if (item.namePlateProductId) {
        return !isDemoProductId(item.namePlateProductId) && item.qualityOptionId
      }
      if (item.corporateGiftProductId) {
        return !isDemoProductId(item.corporateGiftProductId) && item.qualityOptionId
      }
      if (item.babyBirthFrameProductId) {
        return !isDemoProductId(item.babyBirthFrameProductId) && item.qualityOptionId
      }
      if (item.trophyProductId) {
        return !isDemoProductId(item.trophyProductId) && item.qualityOptionId
      }
      if (item.penPrintProductId) {
        return !isDemoProductId(item.penPrintProductId) && item.qualityOptionId
      }
      if (item.uvDtfStickerProductId) {
        return !isDemoProductId(item.uvDtfStickerProductId) && item.qualityOptionId
      }
      if (item.productLabelStickerProductId) {
        return !isDemoProductId(item.productLabelStickerProductId) && item.qualityOptionId
      }
      if (item.tShirtProductId) {
        return !isDemoProductId(item.tShirtProductId)
      }
      return !isDemoProductId(item.productId) && item.variantId
    })

export function CartProvider({ children }) {
  const [cart, setCart] = useState(fallbackCart)
  const cartRef = useRef(cart)
  cartRef.current = cart

  const persist = useCallback((nextCart) => {
    cartRef.current = nextCart
    setCart(nextCart)
    localStorage.setItem('omgs_cart', JSON.stringify(nextCart))
  }, [])

  const refresh = useCallback(async () => {
    try {
      const payload = await api.cart()
      if (payload.cart?.items?.length) {
        persist(payload.cart)
        return payload.cart
      }
      persist(payload.cart || { items: [] })
      return payload.cart || { items: [] }
    } catch {
      return cartRef.current
    }
  }, [persist])

  const syncToServer = useCallback(async () => {
    let localItems = cartRef.current.items || []

    const resolvedItems = []
    for (const item of localItems) {
      if (isSpecialCartItem(item)) {
        resolvedItems.push(item)
        continue
      }
      const product = typeof item.product === 'object' ? item.product : { _id: item.product }
      if (isDemoProductId(product?._id) && product?.slug) {
        try {
          const resolved = await resolveServerProduct(product, { _id: item.variantId, sku: item.variantSku })
          resolvedItems.push({
            ...item,
            product: resolved.product,
            variantId: resolved.variant._id,
          })
          continue
        } catch {
          // keep original item — handled below
        }
      }
      resolvedItems.push(item)
    }

    if (resolvedItems.some((item, index) => item !== localItems[index])) {
      persist({ ...cartRef.current, items: resolvedItems })
      localItems = resolvedItems
    }

    const syncableItems = toSyncPayload(localItems)

    try {
      const payload = await api.cart()
      const serverCart = payload.cart || { items: [] }

      if (serverCart.items?.length) {
        persist(serverCart)
        return serverCart
      }

      if (!syncableItems.length) {
        if (localItems.length) {
          throw new Error(
            'Cart items could not be saved on the server. Open the product from Products, add to cart again, then checkout.',
          )
        }
        persist(serverCart)
        return serverCart
      }

      const synced = await api.syncCart({ items: syncableItems })
      if (!synced.cart?.items?.length) {
        throw new Error('Could not save your cart. Please go back to Cart and try again.')
      }

      persist(synced.cart)
      return synced.cart
    } catch (error) {
      const hasDemoOnly = localItems.some((item) => {
        const productId = typeof item.product === 'object' ? item.product?._id : item.product
        return isDemoProductId(productId)
      })
      if (hasDemoOnly) {
        throw new Error('Cart items are outdated. Go to Products, open the item again, add to cart, then checkout.')
      }
      throw new Error(error.message || 'Could not sync cart with server. Please try again.')
    }
  }, [persist])

  const addLocalItem = useCallback(
    ({ product, variant, quantity, customization }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'product',
        product,
        variantId: variant._id,
        quantity,
        unitPrice: variant.price,
        customization,
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addLocalGodItem = useCallback(
    ({ godProduct, qualityOption, quantity }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'god',
        godProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'god',
          qualityLabel: qualityOption.label,
          previewUrl: godProduct.images?.[0] || '',
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addLocalNamePlateItem = useCallback(
    ({ namePlateProduct, qualityOption, quantity, customization }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'nameplate',
        namePlateProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'nameplate',
          qualityLabel: qualityOption.label,
          previewUrl: namePlateProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addLocalCorporateGiftItem = useCallback(
    ({ corporateGiftProduct, qualityOption, quantity, customization }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'corporategift',
        corporateGiftProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'corporategift',
          qualityLabel: qualityOption.label,
          previewUrl: corporateGiftProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addItem = useCallback(
    async ({ product, variant, quantity = 1, customization = {} }) => {
      let resolvedProduct = product
      let resolvedVariant = variant

      try {
        const resolved = await resolveServerProduct(product, variant)
        resolvedProduct = resolved.product
        resolvedVariant = resolved.variant
      } catch (error) {
        if (isDemoProductId(product?._id)) throw error
      }

      if (isDemoProductId(resolvedProduct?._id)) {
        throw new Error(
          'This product could not be loaded from the server. Go to Products, open the item again, and add to cart.',
        )
      }

      try {
        const payload = await api.addCartItem({
          productId: resolvedProduct._id,
          variantId: resolvedVariant._id,
          quantity,
          customization: {
            ...customization,
            variantSku: resolvedVariant.sku,
            size: resolvedVariant.size,
            material: resolvedVariant.material,
            frameType: resolvedVariant.frameType,
          },
        })
        persist(payload.cart)
      } catch (error) {
        addLocalItem({ product: resolvedProduct, variant: resolvedVariant, quantity, customization })
        console.warn('Saved item locally after cart API error:', error.message)
      }
    },
    [persist, addLocalItem],
  )

  const addGodItem = useCallback(
    async ({ godProduct, qualityOption, quantity = 1 }) => {
      if (!godProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/quality option before adding to cart.')
      }

      try {
        const payload = await api.addCartItem({
          godProductId: godProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalGodItem({ godProduct, qualityOption, quantity })
        console.warn('Saved god frame locally after cart API error:', error.message)
      }
    },
    [persist, addLocalGodItem],
  )

  const addNamePlateItem = useCallback(
    async ({ namePlateProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!namePlateProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/quality option before adding to cart.')
      }

      const headingText = String(customization.headingText || '').trim()
      const subText = String(customization.subText || '').trim()
      if (!headingText || !subText) {
        throw new Error('Please enter both name and address for the name plate.')
      }

      const payloadCustomization = { headingText, subText }

      try {
        const payload = await api.addCartItem({
          namePlateProductId: namePlateProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalNamePlateItem({
          namePlateProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved name plate locally after cart API error:', error.message)
      }
    },
    [persist, addLocalNamePlateItem],
  )

  const addCorporateGiftItem = useCallback(
    async ({ corporateGiftProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!corporateGiftProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/quality option before adding to cart.')
      }

      const designFileUrl = String(customization.designFileUrl || '').trim()
      if (!designFileUrl) {
        throw new Error('Please upload your logo or design file.')
      }

      const minQty = Math.max(1, corporateGiftProduct.minOrderQty || 1)
      if (quantity < minQty) {
        throw new Error(`Minimum order quantity is ${minQty}.`)
      }

      const payloadCustomization = {
        designFileUrl,
        designFileName: customization.designFileName || '',
      }

      try {
        const payload = await api.addCartItem({
          corporateGiftProductId: corporateGiftProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalCorporateGiftItem({
          corporateGiftProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved corporate gift locally after cart API error:', error.message)
      }
    },
    [persist, addLocalCorporateGiftItem],
  )

  const addLocalBabyBirthFrameItem = useCallback(
    ({ babyBirthFrameProduct, qualityOption, quantity, customization }) => {
      const photoUrls = customization.photoUrls || []
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'babybirthframe',
        babyBirthFrameProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'babybirthframe',
          qualityLabel: qualityOption.label,
          previewUrl: photoUrls[0] || babyBirthFrameProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addBabyBirthFrameItem = useCallback(
    async ({ babyBirthFrameProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!babyBirthFrameProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/quality option before adding to cart.')
      }

      const gender = String(customization.gender || '').trim()
      const babyName = String(customization.babyName || '').trim()
      const birthDate = String(customization.birthDate || '').trim()
      const photoUrls = Array.isArray(customization.photoUrls) ? customization.photoUrls.filter(Boolean) : []

      if (!gender) throw new Error('Please select gender.')
      if (!babyName) throw new Error("Please enter baby's name.")
      if (!birthDate) throw new Error('Please enter birth date.')
      if (!photoUrls.length) throw new Error("Please upload baby's photo.")

      const payloadCustomization = {
        gender,
        babyName,
        birthDate,
        birthTime: String(customization.birthTime || '').trim(),
        weight: String(customization.weight || '').trim(),
        height: String(customization.height || '').trim(),
        hospital: String(customization.hospital || '').trim(),
        proudParents: String(customization.proudParents || '').trim(),
        photoUrls,
      }

      try {
        const payload = await api.addCartItem({
          babyBirthFrameProductId: babyBirthFrameProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalBabyBirthFrameItem({
          babyBirthFrameProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved baby birth frame locally after cart API error:', error.message)
      }
    },
    [persist, addLocalBabyBirthFrameItem],
  )

  const addLocalTrophyItem = useCallback(
    ({ trophyProduct, qualityOption, quantity, customization }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'trophy',
        trophyProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'trophy',
          qualityLabel: qualityOption.label,
          previewUrl: trophyProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addTrophyItem = useCallback(
    async ({ trophyProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!trophyProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/type option before adding to cart.')
      }

      const mainHeading = String(customization.mainHeading || '').trim()
      const recipientName = String(customization.recipientName || '').trim()

      if (!mainHeading) throw new Error('Please enter main heading text.')
      if (!recipientName) throw new Error('Please enter recipient / winner name.')

      const payloadCustomization = {
        mainHeading,
        recipientName,
        eventName: String(customization.eventName || '').trim(),
        awardDate: String(customization.awardDate || '').trim(),
        organizationName: String(customization.organizationName || '').trim(),
        logoUrl: String(customization.logoUrl || '').trim(),
      }

      try {
        const payload = await api.addCartItem({
          trophyProductId: trophyProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalTrophyItem({
          trophyProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved trophy locally after cart API error:', error.message)
      }
    },
    [persist, addLocalTrophyItem],
  )

  const addLocalPenPrintItem = useCallback(
    ({ penPrintProduct, qualityOption, quantity, customization }) => {
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'penprint',
        penPrintProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'penprint',
          qualityLabel: qualityOption.label,
          previewUrl: penPrintProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addPenPrintItem = useCallback(
    async ({ penPrintProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!penPrintProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/quality option before adding to cart.')
      }

      const username = String(customization.username || '').trim()
      if (!username) {
        throw new Error('Please enter the name to print on the pen.')
      }

      const payloadCustomization = { username }

      try {
        const payload = await api.addCartItem({
          penPrintProductId: penPrintProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalPenPrintItem({
          penPrintProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved pen print locally after cart API error:', error.message)
      }
    },
    [persist, addLocalPenPrintItem],
  )

  const addLocalUvDtfStickerItem = useCallback(
    ({ uvDtfStickerProduct, qualityOption, quantity, customization }) => {
      const logoUrl = customization.logoUrl || ''
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'uvdtfsticker',
        uvDtfStickerProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'uvdtfsticker',
          qualityLabel: qualityOption.label,
          previewUrl: logoUrl || uvDtfStickerProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addUvDtfStickerItem = useCallback(
    async ({ uvDtfStickerProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!uvDtfStickerProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a size/pack option before adding to cart.')
      }

      const logoUrl = String(customization.logoUrl || '').trim()
      if (!logoUrl) {
        throw new Error('Please upload your logo image.')
      }

      const payloadCustomization = {
        logoUrl,
        logoFileName: String(customization.logoFileName || '').trim(),
      }

      try {
        const payload = await api.addCartItem({
          uvDtfStickerProductId: uvDtfStickerProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalUvDtfStickerItem({
          uvDtfStickerProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved UV DTF sticker locally after cart API error:', error.message)
      }
    },
    [persist, addLocalUvDtfStickerItem],
  )

  const addLocalProductLabelStickerItem = useCallback(
    ({ productLabelStickerProduct, qualityOption, quantity, customization }) => {
      const labelImageUrl = customization.labelImageUrl || ''
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'productlabelsticker',
        productLabelStickerProduct,
        qualityOptionId: qualityOption._id,
        quantity,
        unitPrice: qualityOption.price,
        customization: {
          itemType: 'productlabelsticker',
          qualityLabel: qualityOption.label,
          previewUrl: labelImageUrl || productLabelStickerProduct.images?.[0] || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addProductLabelStickerItem = useCallback(
    async ({ productLabelStickerProduct, qualityOption, quantity = 1, customization = {} }) => {
      if (!productLabelStickerProduct?._id || !qualityOption?._id) {
        throw new Error('Please select a label size before adding to cart.')
      }

      const labelImageUrl = String(customization.labelImageUrl || '').trim()
      if (!labelImageUrl) {
        throw new Error('Please upload your product label image in the selected size.')
      }

      const payloadCustomization = {
        labelImageUrl,
        labelFileName: String(customization.labelFileName || '').trim(),
      }

      try {
        const payload = await api.addCartItem({
          productLabelStickerProductId: productLabelStickerProduct._id,
          qualityOptionId: qualityOption._id,
          quantity,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalProductLabelStickerItem({
          productLabelStickerProduct,
          qualityOption,
          quantity,
          customization: payloadCustomization,
        })
        console.warn('Saved product label sticker locally after cart API error:', error.message)
      }
    },
    [persist, addLocalProductLabelStickerItem],
  )

  const addLocalTShirtItem = useCallback(
    ({ tShirtProduct, quantity, customization }) => {
      const productImageUrl = tShirtProduct?.images?.[0] || customization.productImageUrl || ''
      const localItem = {
        _id: crypto.randomUUID(),
        itemType: 'tshirt',
        tShirtProduct,
        quantity,
        unitPrice: tShirtProduct.price,
        customization: {
          itemType: 'tshirt',
          productImageUrl,
          previewUrl: customization.logoUrl || productImageUrl || '',
          ...customization,
        },
      }
      const current = cartRef.current
      persist({ ...current, items: [...(current.items || []), localItem] })
    },
    [persist],
  )

  const addTShirtItem = useCallback(
    async ({ tShirtProduct, customization = {} }) => {
      if (!tShirtProduct?._id) {
        throw new Error('Product not found. Please refresh and try again.')
      }

      const sizeQuantities = customization.sizeQuantities || {}
      const totalPieces = sumSizeQuantities(sizeQuantities)
      if (totalPieces < 1) {
        throw new Error('Please select at least one t-shirt size quantity.')
      }

      const logoUrl = String(customization.logoUrl || '').trim()
      const notes = String(customization.notes || '').trim()
      if (!logoUrl && !notes) {
        throw new Error('Please upload a logo or add print instructions.')
      }

      const productImageUrl = tShirtProduct?.images?.[0] || ''
      const payloadCustomization = {
        sizeQuantities,
        totalPieces,
        logoUrl,
        notes,
        logoAssetId: customization.logoAssetId || '',
        productImageUrl,
      }

      try {
        const payload = await api.addCartItem({
          tShirtProductId: tShirtProduct._id,
          quantity: totalPieces,
          customization: payloadCustomization,
        })
        persist(payload.cart)
      } catch (error) {
        addLocalTShirtItem({
          tShirtProduct,
          quantity: totalPieces,
          customization: payloadCustomization,
        })
        console.warn('Saved t-shirt locally after cart API error:', error.message)
      }
    },
    [persist, addLocalTShirtItem],
  )

  const updateItem = useCallback(
    async (itemId, quantity) => {
      const current = cartRef.current
      const target = current.items.find((item) => item._id === itemId)
      const productId = typeof target?.product === 'object' ? target.product?._id : target?.product
      const godProductId = typeof target?.godProduct === 'object' ? target.godProduct?._id : target?.godProduct
      const namePlateProductId =
        typeof target?.namePlateProduct === 'object' ? target.namePlateProduct?._id : target?.namePlateProduct
      const corporateGiftProductId =
        typeof target?.corporateGiftProduct === 'object'
          ? target.corporateGiftProduct?._id
          : target?.corporateGiftProduct
      const babyBirthFrameProductId =
        typeof target?.babyBirthFrameProduct === 'object'
          ? target.babyBirthFrameProduct?._id
          : target?.babyBirthFrameProduct
      const trophyProductId =
        typeof target?.trophyProduct === 'object' ? target.trophyProduct?._id : target?.trophyProduct
      const penPrintProductId =
        typeof target?.penPrintProduct === 'object' ? target.penPrintProduct?._id : target?.penPrintProduct
      const uvDtfStickerProductId =
        typeof target?.uvDtfStickerProduct === 'object' ? target.uvDtfStickerProduct?._id : target?.uvDtfStickerProduct
      const productLabelStickerProductId =
        typeof target?.productLabelStickerProduct === 'object'
          ? target.productLabelStickerProduct?._id
          : target?.productLabelStickerProduct
      const tShirtProductId =
        typeof target?.tShirtProduct === 'object' ? target.tShirtProduct?._id : target?.tShirtProduct

      if (
        isDemoProductId(productId) &&
        !godProductId &&
        !namePlateProductId &&
        !corporateGiftProductId &&
        !babyBirthFrameProductId &&
        !trophyProductId &&
        !penPrintProductId &&
        !uvDtfStickerProductId &&
        !productLabelStickerProductId &&
        !tShirtProductId
      ) {
        persist({
          ...current,
          items: current.items.map((item) => (item._id === itemId ? { ...item, quantity } : item)),
        })
        return
      }

      try {
        const payload = await api.updateCartItem(itemId, { quantity })
        persist(payload.cart)
      } catch {
        persist({
          ...current,
          items: current.items.map((item) => (item._id === itemId ? { ...item, quantity } : item)),
        })
      }
    },
    [persist],
  )

  const removeItem = useCallback(
    async (itemId) => {
      const current = cartRef.current
      const target = current.items.find((item) => item._id === itemId)
      const productId = typeof target?.product === 'object' ? target.product?._id : target?.product
      const godProductId = typeof target?.godProduct === 'object' ? target.godProduct?._id : target?.godProduct
      const namePlateProductId =
        typeof target?.namePlateProduct === 'object' ? target.namePlateProduct?._id : target?.namePlateProduct
      const corporateGiftProductId =
        typeof target?.corporateGiftProduct === 'object'
          ? target.corporateGiftProduct?._id
          : target?.corporateGiftProduct
      const babyBirthFrameProductId =
        typeof target?.babyBirthFrameProduct === 'object'
          ? target.babyBirthFrameProduct?._id
          : target?.babyBirthFrameProduct
      const trophyProductId =
        typeof target?.trophyProduct === 'object' ? target.trophyProduct?._id : target?.trophyProduct
      const penPrintProductId =
        typeof target?.penPrintProduct === 'object' ? target.penPrintProduct?._id : target?.penPrintProduct
      const uvDtfStickerProductId =
        typeof target?.uvDtfStickerProduct === 'object' ? target.uvDtfStickerProduct?._id : target?.uvDtfStickerProduct
      const productLabelStickerProductId =
        typeof target?.productLabelStickerProduct === 'object'
          ? target.productLabelStickerProduct?._id
          : target?.productLabelStickerProduct
      const tShirtProductId =
        typeof target?.tShirtProduct === 'object' ? target.tShirtProduct?._id : target?.tShirtProduct

      if (
        isDemoProductId(productId) &&
        !godProductId &&
        !namePlateProductId &&
        !corporateGiftProductId &&
        !babyBirthFrameProductId &&
        !trophyProductId &&
        !penPrintProductId &&
        !uvDtfStickerProductId &&
        !productLabelStickerProductId &&
        !tShirtProductId
      ) {
        persist({ ...current, items: current.items.filter((item) => item._id !== itemId) })
        return
      }

      try {
        const payload = await api.removeCartItem(itemId)
        persist(payload.cart)
      } catch {
        persist({ ...current, items: current.items.filter((item) => item._id !== itemId) })
      }
    },
    [persist],
  )

  const clear = useCallback(() => {
    persist({ items: [] })
  }, [persist])

  const value = useMemo(
    () => ({
      cart,
      count: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      subtotal: cart.items?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) || 0,
      refresh,
      syncToServer,
      addItem,
      addGodItem,
      addNamePlateItem,
      addCorporateGiftItem,
      addBabyBirthFrameItem,
      addTrophyItem,
      addPenPrintItem,
      addUvDtfStickerItem,
      addProductLabelStickerItem,
      addTShirtItem,
      updateItem,
      removeItem,
      clear,
    }),
    [
      cart,
      refresh,
      syncToServer,
      addItem,
      addGodItem,
      addNamePlateItem,
      addCorporateGiftItem,
      addBabyBirthFrameItem,
      addTrophyItem,
      addPenPrintItem,
      addUvDtfStickerItem,
      addProductLabelStickerItem,
      addTShirtItem,
      updateItem,
      removeItem,
      clear,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
