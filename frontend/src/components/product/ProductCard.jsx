import { FiArrowRight, FiHeart, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  formatCurrency,
  getCompareAtPrice,
  getProductPrice,
} from "../../utils/format";
import { getProductDetailPath } from "../../config/categoryRoutes";
import { useWishlist } from "../../hooks/useWishlist";
import { ProductCardFrameImage } from "./ProductCardFrameImage";

export function ProductCard({ product }) {
  const price = getProductPrice(product);
  const compareAt = getCompareAtPrice(product);
  const { isWishlisted, toggleItem } = useWishlist();
  const liked = isWishlisted(product);

  const discount =
    compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const detailPath = getProductDetailPath(product);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative">
        <Link to={detailPath} className="block">
          <ProductCardFrameImage product={product} />
        </Link>

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleItem(product);
          }}
          className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
            liked ? "bg-orange-500 text-white" : "bg-white/95 text-gray-600 hover:text-orange-500"
          }`}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart className={liked ? "fill-current" : ""} />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {product.productType?.replaceAll("-", " ")}
        </p>

        <Link to={detailPath}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition hover:text-orange-600">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiStar className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-700">4.5</span>
          <span>(50+)</span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-bold text-gray-900">{formatCurrency(price)}</span>
          {compareAt > price && (
            <span className="text-sm text-gray-400 line-through">{formatCurrency(compareAt)}</span>
          )}
        </div>

        <Link
          to={detailPath}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Customize Product
          <FiArrowRight />
        </Link>
      </div>
    </article>
  );
}
