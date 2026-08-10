import React from "react";

const brands = [
  {
    id: 1,
    name: "Pendo",
    logo: "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbrand-logo-12.58f45c05.png&w=256&q=75",
  },
  {
    id: 2,
    name: "Airtable",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg",
  },
  {
    id: 3,
    name: "Productboard",
    logo: "https://cdn.worldvectorlogo.com/logos/productboard.svg",
  },
  {
    id: 4,
    name: "Contentful",
    logo: "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbrand-logo-14.b6ecd6ac.png&w=640&q=75",
  },
  {
    id: 5,
    name: "Customer.io",
    logo: "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbrand-logo-16.e174e94c.png&w=640&q=75",
  },
  {
    id: 6,
    name: "InVision",
    logo: "https://cdn.worldvectorlogo.com/logos/invision.svg",
  },
  {
    id: 7,
    name: "Monday",
    logo: "https://cdn.worldvectorlogo.com/logos/monday-1.svg",
  },
];

export default function BrandSlider() {
  return (
    <section className="overflow-hidden bg-gray-100 py-10">
      <div className="relative">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-white to-transparent"></div>

        {/* Right Fade */}
        <div className="absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-white to-transparent"></div>

        {/* Marquee */}
        <div className="marquee flex whitespace-nowrap">
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex min-w-[240px] items-center justify-center px-10"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 object-contain transition duration-300 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}