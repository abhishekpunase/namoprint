import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { homeCategories } from "../../data/fallbackCatalog";

const CategorySection = () => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <p className="uppercase tracking-[4px] text-orange-500 font-semibold text-sm">
          Browse Categories
        </p>
        <h2 className="text-4xl font-bold mt-2">
          Shop By{" "}
          <span className="text-orange-500 italic font-serif">Category</span>
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-orange-500 hover:text-white transition"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        >
          {homeCategories.map((item) => (
            <Link
              key={item.value}
              to={`/category/${item.value}`}
              className="flex flex-col items-center min-w-[120px] shrink-0 group"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-[3px] border-orange-300 group-hover:border-orange-500 transition duration-300 shadow-md">
                <video
                  src={item.video}
                  poster={item.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.insertAdjacentHTML(
                      "afterend",
                      `<img src="${item.poster}" class="w-full h-full object-cover" />`
                    );
                  }}
                />
              </div>
              <h3 className="mt-4 text-center text-[15px] font-semibold text-gray-800 leading-5">
                {item.label}
              </h3>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-orange-500 hover:text-white transition"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
};

export default CategorySection;