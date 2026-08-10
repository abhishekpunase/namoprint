import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ProductCard } from "../product/ProductCard";
import { fallbackProducts } from "../../data/fallbackCatalog";
import { api } from "../../services/api";
import { mergeCatalogProducts } from "../../utils/catalog";
import { excludeWallWatchProducts } from "../../utils/wallWatchCatalog";

import {
  DEFAULT_HOME_OFFER_MARQUEE,
  mapApiHomeOfferMarqueeItem,
} from "../../data/defaultHomeOfferMarquee";

function OfferMarquee({ lines = DEFAULT_HOME_OFFER_MARQUEE.map((item) => item.text) }) {
  const activeLines = lines.filter(Boolean);
  const displayLines = activeLines.length > 0 ? activeLines : DEFAULT_HOME_OFFER_MARQUEE.map((item) => item.text);

  const items = displayLines.flatMap((text, index) =>
    Array.from({ length: 4 }, (_, repeat) => (
      <span
        key={`${text}-${index}-${repeat}`}
        className="mx-8 inline-flex shrink-0 items-center gap-3 text-sm font-semibold tracking-wide"
      >
        {text}
        <span aria-hidden="true" className="text-black/40">
          •
        </span>
      </span>
    )),
  );

  return (
    <section className="overflow-hidden bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-gray-900">
      <style>{`
        @keyframes offer-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .offer-marquee-track {
          animation: offer-marquee 28s linear infinite;
          will-change: transform;
        }
      `}</style>
      <div className="flex h-9 items-center sm:h-10">
        <div className="offer-marquee-track flex w-max whitespace-nowrap">
          <div className="flex shrink-0">{items}</div>
          <div className="flex shrink-0" aria-hidden="true">
            {items}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductHome() {
  const [products, setProducts] = useState(fallbackProducts);
  const [allProducts, setAllProducts] = useState(fallbackProducts);
  const [visibleCount, setVisibleCount] = useState(12);
  const [marqueeLines, setMarqueeLines] = useState(DEFAULT_HOME_OFFER_MARQUEE.map((item) => item.text));

  useEffect(() => {
    api
      .homeOfferMarquee()
      .then((payload) => {
        const lines = (payload.items || [])
          .map((item) => mapApiHomeOfferMarqueeItem(item).text)
          .filter(Boolean);
        if (lines.length > 0) setMarqueeLines(lines);
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  useEffect(() => {
    api
      .products('')
      .then((payload) => {
        const merged = excludeWallWatchProducts(mergeCatalogProducts(payload.items));
        setProducts(merged);
        setAllProducts(merged);
        setVisibleCount(merged.length);
      })
      .catch(() => {});
  }, []);

  const featured = products
    .filter((product) => product.isFeatured)
    .slice(0, 6);

  const displayFeatured = featured.length
    ? featured
    : products.slice(0, 6);

return (
  <div className="bg-[#f8f8f8]">

    {/* ================= Offer Marquee ================= */}

    <OfferMarquee lines={marqueeLines} />

    {/* ================= Featured ================= */}

    <section className="bg-[#F5F5F5] py-20">

      <div className="max-w-7xl mx-auto px-5">

        <div className="mb-12">

          <p className="uppercase tracking-[3px] text-yellow-500 font-semibold">
            Curated Collection
          </p>

          <h2 className="text-5xl font-bold mt-2">
            Featured{" "}
            <span className="italic text-yellow-500">
              Products
            </span>
          </h2>

        </div>

        <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">

          {displayFeatured.map((product) => (

            <div
              key={product._id}
              className="rounded-[28px] overflow-hidden bg-white border border-gray-200 hover:shadow-2xl transition duration-500 hover:-translate-y-2"
            >

              <ProductCard product={product} />

            </div>

          ))}

        </div>

      </div>

    </section>

    {/* ================= All Products ================= */}

    <section className="max-w-7xl mx-auto px-5 py-20">

      <div className="flex items-end justify-between mb-12">

        <div>

          <p className="uppercase tracking-[3px] text-yellow-500 font-semibold">
            Full Catalog
          </p>

          <h2 className="text-5xl font-bold mt-2">
            All{" "}
            <span className="italic text-yellow-500">
              Products
            </span>
          </h2>

        </div>

        <Link
          to="/products"
          className="hidden sm:flex items-center gap-2 text-yellow-500 font-semibold hover:gap-3 transition-all duration-300"
        >
          View All
          <FiArrowRight />
        </Link>

      </div>

      {allProducts.length > 0 ? (

        <>

          <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">

            {allProducts.slice(0, visibleCount).map((product) => (

              <div
                key={product._id}
                className="rounded-[28px] overflow-hidden bg-white border border-gray-200 hover:shadow-2xl transition duration-500 hover:-translate-y-2"
              >

                <ProductCard product={product} />

              </div>

            ))}

          </div>

          {visibleCount < allProducts.length && (

            <div className="flex justify-center mt-12">

              <button
                onClick={() => setVisibleCount((count) => count + 12)}
                className="px-8 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition duration-300 shadow-md hover:shadow-lg"
              >
                Show More
              </button>

            </div>

          )}

        </>

      ) : (

        <p className="text-center text-gray-500 py-10">
          No products available right now.
        </p>

      )}

      <div className="flex sm:hidden justify-center mt-10">

        <Link
          to="/products"
          className="flex items-center gap-2 text-yellow-500 font-semibold"
        >
          View All Products
          <FiArrowRight />
        </Link>

      </div>

    </section>

    {/* ================= Process ================= */}

    <section className="max-w-7xl mx-auto px-5 py-24">

      <div className="text-center mb-14">

        <p className="uppercase tracking-[3px] text-yellow-500 font-semibold">
          How It Works
        </p>

        <h2 className="text-4xl font-bold">
          Order In Just 3 Easy Steps
        </h2>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {[
          [
            "01",
            "Choose Product",
            "Pick your favourite nameplate, trophy, acrylic frame, album or gift."
          ],
          [
            "02",
            "Upload Your Design",
            "Upload your image, customize text, adjust size and preview instantly."
          ],
          [
            "03",
            "Secure Checkout",
            "Complete payment securely and receive your personalized order at home."
          ],
        ].map(([number, title, copy]) => (

          <div
            key={number}
            className="relative rounded-3xl bg-white border border-gray-200 p-10 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >

            <div className="absolute -top-7 left-8 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
              {number}
            </div>

            <div className="mt-8">

              <h3 className="text-2xl font-bold mb-4">
                {title}
              </h3>

              <p className="text-gray-600 leading-7">
                {copy}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>

  </div>
);
}