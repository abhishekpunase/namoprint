import { HomeOfferMarqueeItem } from '../models/HomeOfferMarqueeItem.js';

const DEFAULT_HOME_OFFER_MARQUEE = [
  { text: 'Launching offer 10% offer', sortOrder: 0 },
  { text: 'Free Shipping on Orders Above ₹999', sortOrder: 1 },
  { text: 'Flat 10% OFF on First Order', sortOrder: 2 },
];

export async function ensureHomeOfferMarquee() {
  const count = await HomeOfferMarqueeItem.countDocuments();
  if (count > 0) return;

  await HomeOfferMarqueeItem.insertMany(DEFAULT_HOME_OFFER_MARQUEE);
  console.log(`Home offer marquee seeded (${DEFAULT_HOME_OFFER_MARQUEE.length} lines).`);
}
