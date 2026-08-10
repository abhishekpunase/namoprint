import React from "react";

export default function ProcessCard({
  image,
  title,
  description,
  number,
  active,
}) {
  return (
    <div
      className={`relative rounded-3xl border border-gray-200 px-8 pt-14 pb-20 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
        active ? "bg-[#F8F4FD]" : "bg-white"
      }`}
    >
      {/* Image */}
      <div className="mb-10 flex justify-center">
        <div className="h-32 w-72 overflow-hidden rounded-full">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-5 text-[22px] font-bold text-black">
        {title}
      </h3>

      {/* Description */}
      <p className="text-lg leading-8 text-gray-500">
        {description}
      </p>

      {/* Number */}
      <div className="absolute left-1/2 -bottom-6 -translate-x-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-3xl font-bold text-white shadow-lg">
          {number}
        </div>
      </div>
    </div>
  );
}