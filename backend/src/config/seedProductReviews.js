import { ProductReview } from '../models/ProductReview.js';

const DEFAULT_REVIEWS = [
  {
    customerName: 'Priya Sharma',
    productTitle: 'Custom Photo Wall Clock',
    productType: 'wall-watch',
    rating: 5,
    title: 'Beautiful quality!',
    reviewText: 'Print quality is excellent and delivery was fast. The clock looks perfect in our living room.',
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    sortOrder: 0,
  },
  {
    customerName: 'Rahul Mehta',
    productTitle: 'God Photo Frame',
    productType: 'god-product',
    rating: 5,
    title: 'Perfect for pooja room',
    reviewText: 'Frame finish is premium and the photo print is very sharp. Highly recommended.',
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
  },
  {
    customerName: 'Anita Desai',
    productTitle: 'Name Plate',
    productType: 'nameplate',
    rating: 4,
    title: 'Elegant design',
    reviewText: 'Golden letters look very classy on our main door. Installation was easy too.',
    isVerified: true,
    isFeatured: false,
    isPublished: true,
    sortOrder: 2,
  },
  {
    customerName: 'Vikram Singh',
    productTitle: 'Custom T-Shirt',
    productType: 'tshirt',
    rating: 5,
    title: 'Great print, soft fabric',
    reviewText: 'Ordered a custom tee for an event. Colors came out vibrant and the fabric feels good.',
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    sortOrder: 3,
  },
  {
    customerName: 'Neha Kapoor',
    productTitle: 'Branded Corporate Gift',
    productType: 'corporate-gift',
    productSlug: 'branded-acrylic-sign-board',
    rating: 5,
    title: 'Perfect for office branding',
    reviewText:
      'Ordered acrylic sign boards with our company logo for the reception. Print quality is sharp and delivery was on time.',
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    sortOrder: 4,
  },
  {
    customerName: 'Arjun Patel',
    productTitle: 'Corporate Gift Combo',
    productType: 'corporate-gift',
    rating: 4,
    title: 'Good bulk order experience',
    reviewText:
      'Placed a bulk order for client gifting. Team handled custom branding well and packaging was professional.',
    isVerified: true,
    isFeatured: false,
    isPublished: true,
    sortOrder: 5,
  },
];

export async function ensureProductReviews() {
  const count = await ProductReview.countDocuments();
  if (count > 0) return;

  await ProductReview.insertMany(DEFAULT_REVIEWS);
  console.log(`Product reviews seeded (${DEFAULT_REVIEWS.length} reviews).`);
}
