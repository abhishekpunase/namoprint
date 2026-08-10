export const DEFAULT_HOME_TESTIMONIAL_SECTION = {
  badge: 'Customer Testimonials',
  heading: 'What Our Happy Customers\nSay About Namo Print',
  subtitle:
    'Thousands of customers trust Namo Print for premium quality customized products, fast delivery and excellent customer support.',
};

export const DEFAULT_HOME_TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    role: 'Verified Customer',
    imageUrl:
      'https://img.magnific.com/free-photo/young-indian-man-dressed-trendy-outfit-monitoring-information-from-social-networks_231208-2766.jpg?semt=ais_hybrid&w=740&q=80',
    title: 'Excellent Printing Quality',
    review:
      'I ordered acrylic photo frames from Namo Print and the quality was outstanding. Premium finishing, secure packaging, and fast delivery. I will definitely order again.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Happy Customer',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEFFjex52nKR_gx4GWeLDT431EeOVjhsrvQYc1-HtHcRYP4tjs_rKFOMc&s=10',
    title: 'Amazing Experience',
    review:
      'The customized mugs and T-shirts were printed perfectly. The colors are vibrant, exactly as shown in the preview, and delivery was on time.',
    rating: 5,
  },
  {
    name: 'Amit Verma',
    role: 'Satisfied Customer',
    imageUrl:
      'https://media.istockphoto.com/id/1361217779/photo/portrait-of-happy-teenage-boy-at-park.jpg?s=612x612&w=0&k=20&c=yGHZLPu6UWwoj2wazbbepxmjl29MS1Hr2jV3N0FzjyI=',
    title: 'Highly Recommended',
    review:
      'Business cards and brochures exceeded our expectations. Premium paper quality with excellent customer support throughout the process.',
    rating: 5,
  },
  {
    name: 'Neha Gupta',
    role: 'Returning Customer',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    title: 'Beautiful Products',
    review:
      'The wall frames and photo albums were beautifully printed. Excellent finishing and great value for money.',
    rating: 5,
  },
  {
    name: 'Arjun Singh',
    role: 'Verified Buyer',
    imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
    title: 'Professional Service',
    review:
      'Canvas prints look amazing. Sharp colors, premium materials, and very quick delivery. Highly satisfied with the overall experience.',
    rating: 5,
  },
  {
    name: 'Sneha Iyer',
    role: 'Loyal Customer',
    imageUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
    title: 'Fantastic Support',
    review:
      'Their support team helped me choose the perfect size for my customized wall photo. Everything arrived exactly as expected.',
    rating: 5,
  },
];

export function mapApiHomeTestimonial(item) {
  return {
    id: item._id || item.id,
    name: item.name || '',
    role: item.role || 'Verified Customer',
    image: item.imageUrl || item.image || '',
    title: item.title || '',
    review: item.review || '',
    rating: Number(item.rating) || 5,
  };
}

export function mapApiHomeTestimonialSection(section) {
  return {
    badge: section?.badge || DEFAULT_HOME_TESTIMONIAL_SECTION.badge,
    heading: section?.heading || DEFAULT_HOME_TESTIMONIAL_SECTION.heading,
    subtitle: section?.subtitle || DEFAULT_HOME_TESTIMONIAL_SECTION.subtitle,
  };
}
