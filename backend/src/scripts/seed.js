import { connectDb } from '../src/config/db.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';

const mainCategories = [
  ['Custom Wall Watch', 'custom-wall-watch', ['Round Photo Clock', 'Square Photo Clock', 'Couple Clock', 'Family Clock']],
  ['Acrylic Photo Frame', 'acrylic-photo-frame', ['Table Top', 'Wall Mount', 'Magnetic Frame']],
  ['Acrylic Name Plate', 'acrylic-name-plate', ['House Name Plate', 'Office Name Plate', 'LED Name Plate']],
  ['Acrylic Monogram Nameplate', 'acrylic-monogram-nameplate', ['Couple Monogram', 'Family Monogram']],
  ['Acrylic Wall Photo', 'acrylic-wall-photo', ['Collage', 'Portrait', 'Square', 'Landscape', 'Dual Border', 'Baby Birth', 'Creative Wall']],
  ['Personalised Keychains', 'personalised-keychain', ['Photo Keychain', 'Name Keychain', 'Couple Keychain']],
  ['Luggage Tags', 'luggage-tag', ['Name Tag', 'Photo Tag', 'Kids Tag']],
  ['Acrylic Photo Mini Wall Gallery', 'acrylic-photo-mini-wall-gallery', ['3 Photo Set', '6 Photo Set', '9 Photo Set']],
  ['Acrylic Photo Stand', 'acrylic-photo-stand', ['Mini Stand', 'Desk Stand', 'Spotify Stand']],
  ['Photo Albums', 'photo-album', ['Wedding Album', 'Baby Album', 'Travel Album']]
];

const run = async () => {
  await connectDb();
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), User.deleteMany({ role: { $ne: 'admin' } })]);

  const categoryMap = {};
  for (const [name, productType, children] of mainCategories) {
    let parentId = undefined;
    if (productType === 'acrylic-wall-photo') {
      parentId = '6a46564a69e14b94565be629';
    } else if (productType === 'custom-wall-watch') {
      parentId = '6a46564a69e14b94565be630';
    } else if (productType === 'acrylic-photo-frame') {
      parentId = '6a46564a69e14b94565be631';
    }
    const parent = await Category.create({
      _id: parentId,
      name,
      productType
    });
    categoryMap[productType] = parent;
    for (let index = 0; index < children.length; index += 1) {
      let childId = undefined;
      if (productType === 'acrylic-wall-photo' && children[index] === 'Portrait') {
        childId = '6a46564b69e14b94565be62d';
      }
      const child = await Category.create({
        _id: childId,
        name: children[index],
        productType,
        parent: parent._id,
        sortOrder: index
      });
      categoryMap[`${productType}_${children[index]}`] = child;
    }
  }

  // 1. Premium Acrylic Wall Photo Portrait
  await Product.create({
    _id: '6a46565469e14b94565be662',
    title: 'Premium Acrylic Wall Photo Portrait',
    productType: 'acrylic-wall-photo',
    category: categoryMap['acrylic-wall-photo']._id,
    subCategory: categoryMap['acrylic-wall-photo_Portrait']?._id,
    description: 'High gloss acrylic portrait print for Indian homes and gifting.',
    highlights: [
      'HD acrylic print',
      'Ready to hang',
      'Water resistant finish'
    ],
    images: [],
    attributes: {
      size: ['8x12 inch', '12x18 inch', '16x24 inch'],
      material: ['3mm Acrylic', '5mm Acrylic'],
      frameType: ['No Frame', 'Dual Border'],
      finish: [],
      theme: []
    },
    personalization: {
      allowPhotoUpload: true,
      maxPhotos: 1,
      allowText: true,
      textFields: ['caption']
    },
    mockup: {
      baseImageUrl: '',
      overlayImageUrl: '',
      photoBox: { x: 90, y: 80, width: 820, height: 1090, rotate: 0, borderRadius: 18 },
      canvas: { width: 1000, height: 1250 },
      slots: [
        { x: 9, y: 6.4, w: 82, h: 87.2, shape: 'rect', radius: 18, bg: '#eeeeee' }
      ]
    },
    variants: [
      {
        _id: '6a46565469e14b94565be663',
        sku: 'AWP-POR-8X12-3MM',
        size: '8x12 inch',
        material: '3mm Acrylic',
        frameType: 'No Frame',
        printArea: { widthMm: 203, heightMm: 305, bleedMm: 3, minDpi: 200 },
        price: 699,
        compareAtPrice: 999,
        stock: 100,
        isActive: true
      },
      {
        _id: '6a46565469e14b94565be664',
        sku: 'AWP-POR-12X18-5MM',
        size: '12x18 inch',
        material: '5mm Acrylic',
        frameType: 'Dual Border',
        printArea: { widthMm: 305, heightMm: 457, bleedMm: 3, minDpi: 200 },
        price: 1299,
        compareAtPrice: 1899,
        stock: 75,
        isActive: true
      }
    ],
    seo: {
      title: 'Personalised Acrylic Wall Photo Online India',
      description: 'Upload your photo and order premium acrylic wall photos online.',
      keywords: ['acrylic wall photo', 'personalized photo frame', 'photo decor India']
    },
    isFeatured: true,
    isActive: true,
    slug: 'premium-acrylic-wall-photo-portrait'
  });

  // 2. Square Round Acrylic Photo Wall Clock
  await Product.create({
    _id: '6a46565469e14b94565be701',
    title: 'Square Round Acrylic Photo Wall Clock',
    productType: 'custom-wall-watch',
    category: categoryMap['custom-wall-watch']._id,
    subCategory: categoryMap['custom-wall-watch_Square Photo Clock']?._id,
    description: 'Personalised wall clock with a clean dial and your favourite family photo.',
    highlights: ['Silent movement', 'Photo dial', 'Gift packaging'],
    images: [],
    attributes: {
      size: ['10 inch', '12 inch', '14 inch'],
      material: ['Acrylic'],
      frameType: ['Round', 'Square'],
      finish: [],
      theme: []
    },
    personalization: {
      allowPhotoUpload: true,
      maxPhotos: 1,
      allowText: false,
      textFields: []
    },
    mockup: {
      baseImageUrl: '',
      overlayImageUrl: '',
      photoBox: { x: 160, y: 160, width: 680, height: 680, rotate: 0, borderRadius: 340 },
      canvas: { width: 1000, height: 1000 },
      slots: [
        { x: 16, y: 16, w: 68, h: 68, shape: 'circle', radius: 340, bg: '#f8fafc' }
      ]
    },
    variants: [
      {
        sku: 'CWW-SQR-ROUND-10',
        size: '10 inch',
        material: 'Acrylic',
        frameType: 'Round',
        price: 899,
        compareAtPrice: 1299,
        stock: 60,
        isActive: true
      }
    ],
    seo: {
      title: 'Square Round Personalised Photo Wall Clock India',
      description: 'Design square round personalized photo clocks online.',
      keywords: ['photo clock', 'acrylic wall watch', 'photo watch India']
    },
    isFeatured: true,
    isActive: true,
    slug: 'square-round-acrylic-photo-wall-clock'
  });

  // 3. Leaf Shape Acrylic Wall Clock
  await Product.create({
    _id: '6a46565469e14b94565be702',
    title: 'Leaf Shape Acrylic Wall Clock',
    productType: 'custom-wall-watch',
    category: categoryMap['custom-wall-watch']._id,
    subCategory: categoryMap['custom-wall-watch_Round Photo Clock']?._id,
    description: 'Leaf-cut acrylic clock with photo dial and silent movement.',
    highlights: ['Leaf shape', 'Silent clock hands', 'Photo upload'],
    images: [],
    attributes: {
      size: ['12 inch'],
      material: ['Acrylic'],
      frameType: ['Leaf'],
      finish: [],
      theme: []
    },
    personalization: {
      allowPhotoUpload: true,
      maxPhotos: 1,
      allowText: false,
      textFields: []
    },
    mockup: {
      baseImageUrl: '',
      overlayImageUrl: '',
      photoBox: { x: 180, y: 160, width: 640, height: 640, rotate: 0, borderRadius: 70 },
      canvas: { width: 1000, height: 1000 },
      slots: [
        { x: 18, y: 16, w: 64, h: 64, shape: 'leaf', radius: 70, bg: '#f8fafc' }
      ]
    },
    variants: [
      {
        sku: 'CWW-LEAF-12',
        size: '12 inch',
        material: 'Acrylic',
        frameType: 'Leaf',
        price: 999,
        compareAtPrice: 1399,
        stock: 50,
        isActive: true
      }
    ],
    seo: {
      title: 'Leaf Shape Acrylic Wall Clock Online',
      description: 'Order custom leaf shape wall clocks with personal photos.',
      keywords: ['leaf clock', 'custom clock', 'acrylic wall watch']
    },
    isFeatured: false,
    isActive: true,
    slug: 'leaf-shape-acrylic-wall-clock'
  });

  // 4. Four Photo Collage Wall Clock
  await Product.create({
    _id: '6a46565469e14b94565be705',
    title: 'Four Photo Collage Wall Clock',
    productType: 'custom-wall-watch',
    category: categoryMap['custom-wall-watch']._id,
    subCategory: categoryMap['custom-wall-watch_Family Clock']?._id,
    description: 'Four-photo collage clock with separate upload zones for every quarter.',
    highlights: ['4 photo slots', 'Collage dial', 'Silent movement'],
    images: [],
    attributes: {
      size: ['12 inch'],
      material: ['Acrylic'],
      frameType: ['Collage'],
      finish: [],
      theme: []
    },
    personalization: {
      allowPhotoUpload: true,
      maxPhotos: 4,
      allowText: false,
      textFields: []
    },
    mockup: {
      baseImageUrl: '',
      overlayImageUrl: '',
      photoBox: { x: 140, y: 140, width: 720, height: 720, rotate: 0, borderRadius: 30 },
      canvas: { width: 1000, height: 1000 },
      slots: [
        { x: 14, y: 14, w: 34, h: 34, shape: 'rect', radius: 15, bg: '#eeeeee' },
        { x: 52, y: 14, w: 34, h: 34, shape: 'rect', radius: 15, bg: '#eeeeee' },
        { x: 14, y: 52, w: 34, h: 34, shape: 'rect', radius: 15, bg: '#eeeeee' },
        { x: 52, y: 52, w: 34, h: 34, shape: 'rect', radius: 15, bg: '#eeeeee' }
      ]
    },
    variants: [
      {
        sku: 'CWW-COLLAGE-12',
        size: '12 inch',
        material: 'Acrylic',
        frameType: 'Collage',
        price: 1199,
        compareAtPrice: 1699,
        stock: 45,
        isActive: true
      }
    ],
    seo: {
      title: 'Four Photo Collage Wall Clock Online',
      description: 'Order 4 photo collage wall watches for living room.',
      keywords: ['collage clock', 'family wall watch', '4 photo clock']
    },
    isFeatured: true,
    isActive: true,
    slug: 'four-photo-collage-wall-clock'
  });

  // 5. Newborn Baby Birth Details Frame
  await Product.create({
    _id: '6a46565469e14b94565be706',
    title: 'New Born Baby Birth Details Frame',
    productType: 'acrylic-wall-photo',
    category: categoryMap['acrylic-wall-photo']._id,
    subCategory: categoryMap['acrylic-wall-photo_Baby Birth']?._id,
    description: 'Premium baby birth announcement acrylic print with customized date, weight, time, and location.',
    highlights: ['Dual photo slots', 'Flower cut mask', 'Glossy acrylic finish'],
    images: [],
    attributes: {
      size: ['12x16 inch', '16x20 inch'],
      material: ['3mm Acrylic', '5mm Acrylic'],
      frameType: ['Baby Birth'],
      finish: [],
      theme: []
    },
    personalization: {
      allowPhotoUpload: true,
      maxPhotos: 2,
      allowText: true,
      textFields: ['babyName', 'date', 'weight', 'time', 'hospital', 'parents']
    },
    mockup: {
      baseImageUrl: '',
      overlayImageUrl: '',
      photoBox: { x: 280, y: 200, width: 440, height: 250, rotate: 0, borderRadius: 0 },
      canvas: { width: 1000, height: 1250 },
      ratio: [3, 4],
      allowOrientation: false,
      background: { color: '#ffffff', image: '/templates/newborn-baby.png', imageIsPattern: false },
      slots: [
        { x: 28, y: 20, w: 44, h: 25, shape: 'circle', radius: 0, bg: '#4a4a4a' },
        { x: 31, y: 52, w: 38, h: 27, shape: 'rect', radius: 6, bg: '#4a4a4a' }
      ],
      texts: [
        { value: 'Agstya Roy', x: 32, y: 3, fs: 8, fontFamily: "'Snell Roundhand', 'Brush Script MT', cursive", color: '#000000' },
        { value: '21 Aug 2024', x: 7, y: 21, fs: 3.6, color: '#000000' },
        { value: '2.9 Kg', x: 8, y: 34, fs: 3.6, color: '#000000' },
        { value: '9:45 AM', x: 76, y: 37, fs: 3.6, color: '#000000' },
        { value: 'Sadar Hospital', x: 72, y: 62, fs: 3.6, color: '#000000' },
        { value: 'Proud Parents', x: 38, y: 81, fs: 3.6, color: '#000000' },
        { value: 'Rahul + Priya', x: 30, y: 86, fs: 7, color: '#000000' }
      ]
    },
    variants: [
      {
        sku: 'AWP-BABY-12X16',
        size: '12x16 inch',
        material: '3mm Acrylic',
        frameType: 'Baby Birth',
        price: 1499,
        compareAtPrice: 2199,
        stock: 50,
        isActive: true
      }
    ],
    seo: {
      title: 'New Born Baby Birth Details Acrylic Frame Online',
      description: 'Order personalized baby birth details frames online in India.',
      keywords: ['baby birth frame', 'baby details frame', 'acrylic photo frame baby']
    },
    isFeatured: true,
    isActive: true,
    slug: 'new-born-baby-birth-details-frame'
  });

  const admin = await User.findOne({ email: 'admin@omg.com' });
  if (!admin) {
    const user = new User({
      name: 'OMGS Admin',
      email: 'admin@omgs.com',
      role: 'admin'
    });
    user.password = 'Admin@12345';
    await user.save();
  }

  console.log('Seed complete. Admin: admin@omgs.com / Admin@12345');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
