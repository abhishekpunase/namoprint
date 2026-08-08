/**
 * Resolve a product variant when cart stores a stale variantId (e.g. after admin re-save).
 */
export function resolveProductVariant(product, variantId, hints = {}) {
  if (!product?.variants?.length) return null;

  let variant = variantId ? product.variants.id(variantId) : null;
  if (variant) return variant;

  const idStr = String(variantId || '');
  if (idStr) {
    variant = product.variants.find((entry) => String(entry._id) === idStr);
    if (variant) return variant;
  }

  if (hints.sku) {
    variant = product.variants.find((entry) => entry.sku === hints.sku && entry.isActive !== false);
    if (variant) return variant;
  }

  const size = hints.size;
  if (size) {
    variant = product.variants.find(
      (entry) =>
        entry.isActive !== false &&
        entry.size === size &&
        (entry.material || 'Acrylic') === (hints.material || 'Acrylic') &&
        (entry.frameType || 'None') === (hints.frameType || 'None'),
    );
    if (variant) return variant;
  }

  if (hints.unitPrice != null) {
    const byPrice = product.variants.filter(
      (entry) => entry.isActive !== false && entry.price === hints.unitPrice,
    );
    if (byPrice.length === 1) return byPrice[0];
    if (byPrice.length > 1 && size) {
      variant = byPrice.find((entry) => entry.size === size);
      if (variant) return variant;
    }
  }

  return null;
}

export function resolveProductVariantFromCartItem(product, cartItem) {
  const customization = cartItem?.customization || {};
  const options = customization.options || {};

  return resolveProductVariant(product, cartItem?.variantId, {
    unitPrice: cartItem?.unitPrice,
    sku: customization.variantSku,
    size: customization.size || options.size,
    material: customization.material || options.material,
    frameType: customization.frameType || options.frameType,
  });
}
