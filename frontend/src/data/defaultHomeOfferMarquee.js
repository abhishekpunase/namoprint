export const DEFAULT_HOME_OFFER_MARQUEE = [
  { text: 'Launching offer 10% offer', sortOrder: 0 },
  { text: 'Free Shipping on Orders Above ₹999', sortOrder: 1 },
  { text: 'Flat 10% OFF on First Order', sortOrder: 2 },
];

export function mapApiHomeOfferMarqueeItem(item) {
  return {
    id: item._id || item.id,
    text: item.text || '',
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive !== false,
  };
}
