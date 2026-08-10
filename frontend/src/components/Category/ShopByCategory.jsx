import React, { useState, useMemo, useRef } from "react";
import {
  Frame, Clock, Baby, Tag, QrCode, Trophy, Gift, Mail, TreePine,
  Lightbulb, Image, Images, Palette, Sparkles, Church, PenTool,
  Shirt, Sticker, Tags, ArrowLeft, Star, ShoppingCart, ChevronLeft, ChevronRight
} from "lucide-react";

// Small animated placeholder GIF generator (swap for real product/category
// photography — just pass a real .gif/.jpg/.png URL in its place).
function placeholderGif(label, bg = "fb923c", fg = "ffffff") {
  return `https://placehold.co/300x300/${bg}/${fg}.gif?text=${encodeURIComponent(label)}`;
}

// ---------------------------------------------------------------------------
// 1. CATEGORY DATA
//    Each category has: id, name, icon, tint (soft bg for the circle) and a
//    short blurb used to generate its product catalogue.
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { id: "acrylic-photo-frame",   name: "Acrylic Photo Frame",  icon: Frame,     tint: "bg-orange-50" },
  { id: "acrylic-wall-clock",    name: "Acrylic Wall Clock",   icon: Clock,     tint: "bg-amber-50" },
  { id: "baby-frames",           name: "Baby Frames",          icon: Baby,      tint: "bg-rose-50" },
  { id: "name-plates",           name: "Name Plates",          icon: Tag,       tint: "bg-stone-50" },
  { id: "qr-standee",            name: "QR Standee",           icon: QrCode,    tint: "bg-slate-50" },
  { id: "wedding-card",          name: "Wedding Card",         icon: Mail,      tint: "bg-pink-50" },
  { id: "wooden-photo-frame",    name: "Wooden Photo Frame",   icon: TreePine,  tint: "bg-amber-50" },
  { id: "led-photo-frame",       name: "LED Photo Frame",      icon: Lightbulb, tint: "bg-yellow-50" },
  { id: "table-photo-frame",     name: "Table Photo Frame",    icon: Image,     tint: "bg-orange-50" },
  { id: "wall-photo-frame",      name: "Wall Photo Frame",     icon: Image,     tint: "bg-stone-50" },
  { id: "photo-collage",         name: "Photo Collage",        icon: Images,    tint: "bg-rose-50" },
  { id: "photo-clock",           name: "Photo Clock",          icon: Clock,     tint: "bg-amber-50" },
  { id: "uv-dtf-stickers",       name: "UV DTF Stickers",      icon: Sticker,   tint: "bg-orange-50" },
  { id: "logo-stickers",         name: "Logo Stickers",        icon: Sticker,   tint: "bg-slate-50" },
  { id: "product-labels",        name: "Product Labels",       icon: Tags,      tint: "bg-amber-50" },
];

// ---------------------------------------------------------------------------
// 2. MOCK PRODUCT GENERATOR
//    Replace this with a real fetch("/api/categories/:id/products") call —
//    the shape it returns (id, name, price, rating) is what ProductCard needs.
// ---------------------------------------------------------------------------
function generateProducts(category) {
  const sizes = ["8x10\"", "12x18\"", "A4", "16x24\"", "6x8\"", "Custom Size"];
  const count = 8;
  return Array.from({ length: count }, (_, i) => {
    const price = 299 + ((i * 137 + category.name.length * 13) % 1800);
    const rating = (3.8 + ((i + category.name.length) % 12) / 10).toFixed(1);
    return {
      id: `${category.id}-${i + 1}`,
      name: `${category.name} - Design ${i + 1}`,
      size: sizes[i % sizes.length],
      price,
      mrp: price + 200 + (i % 3) * 150,
      rating: Math.min(5, rating),
      icon: category.icon,
    };
  });
}

// ---------------------------------------------------------------------------
// 3. UI PIECES
// ---------------------------------------------------------------------------
function CategoryCircle({ category, onSelect }) {
  const Icon = category.icon;
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={() => onSelect(category)}
      className="flex flex-col items-center gap-2 sm:gap-3 shrink-0 w-20 sm:w-24 md:w-28 group focus:outline-none"
    >
      <span
        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ${category.tint} border-2 border-orange-300 group-hover:border-orange-500 group-focus-visible:ring-2 group-focus-visible:ring-orange-500 flex items-center justify-center overflow-hidden transition-colors duration-200 shadow-sm group-hover:shadow-md`}
      >
        {!imgError ? (
          <img
            src={placeholderGif(category.name)}
            alt={category.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-orange-600" strokeWidth={1.75} />
        )}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-neutral-900 text-center leading-tight">
        {category.name}
      </span>
    </button>
  );
}

function ProductCard({ product }) {
  const Icon = product.icon;
  const [imgError, setImgError] = useState(false);
  const discount = Math.round(100 - (product.price / product.mrp) * 100);
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="aspect-square bg-orange-50 flex items-center justify-center relative overflow-hidden">
        {!imgError ? (
          <img
            src={placeholderGif(product.name, "ffedd5", "c2410c")}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-12 h-12 text-orange-400" strokeWidth={1.5} />
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-orange-600 text-white text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 grow">
        <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[11px] sm:text-xs text-neutral-500">{product.size}</p>
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-600">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium">{product.rating}</span>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-neutral-900">₹{product.price}</span>
          {discount > 0 && (
            <span className="text-[11px] sm:text-xs text-neutral-400 line-through">₹{product.mrp}</span>
          )}
        </div>
        <button className="mt-2 w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold py-1.5 sm:py-2 rounded-lg transition-colors">
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductsPage({ category, onBack }) {
  const products = useMemo(() => generateProducts(category), [category]);
  const Icon = category.icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
      {/* Breadcrumb / back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-1">
        <span className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${category.tint} border-2 border-orange-300 flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[11px] sm:text-xs font-bold tracking-wide text-orange-600 uppercase">
            Category
          </p>
          <h1 className="text-lg sm:text-2xl font-extrabold text-neutral-900">{category.name}</h1>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6 ml-14 sm:ml-[4.5rem]">
        {products.length} products found
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function CategoriesHome({ onSelect }) {
  const trackRef = useRef(null);

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 text-center">
      {/* hide the native scrollbar on the slider track */}
      <style>{`
        .category-slider-track::-webkit-scrollbar { display: none; }
        .category-slider-track { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <p className="text-[11px] sm:text-xs font-bold tracking-widest text-orange-600 uppercase mb-2">
        Browse Categories
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 mb-6 sm:mb-8">
        Shop By <span className="text-orange-600 italic">Category</span>
      </h2>

      <div className="relative px-8 sm:px-10">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll categories left"
          className="flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </button>

        {/* Slider track */}
        <div
          ref={trackRef}
          className="category-slider-track flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth px-1 justify-start"
        >
          {CATEGORIES.map((cat) => (
            <CategoryCircle key={cat.id} category={cat} onSelect={onSelect} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll categories right"
          className="flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. ROOT COMPONENT — swaps between the category grid and the products page
// ---------------------------------------------------------------------------
export default function ShopByCategory() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="w-full min-h-full bg-white">
      {selectedCategory ? (
        <ProductsPage
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
        />
      ) : (
        <CategoriesHome onSelect={setSelectedCategory} />
      )}
    </div>
  );
}