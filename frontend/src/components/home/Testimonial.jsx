import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Star } from "lucide-react";
import { api } from "../../services/api";
import {
  DEFAULT_HOME_TESTIMONIALS,
  DEFAULT_HOME_TESTIMONIAL_SECTION,
  mapApiHomeTestimonial,
  mapApiHomeTestimonialSection,
} from "../../data/defaultHomeTestimonials";
import { resolveMediaUrl } from "../../utils/mediaUrl";

import "swiper/css";

const Testimonial = () => {
  const [section, setSection] = useState(DEFAULT_HOME_TESTIMONIAL_SECTION);
  const [testimonials, setTestimonials] = useState(
    DEFAULT_HOME_TESTIMONIALS.map((item, index) => ({
      ...item,
      id: index + 1,
      image: item.imageUrl,
    })),
  );

  useEffect(() => {
    api
      .homeTestimonials()
      .then((payload) => {
        if (payload.section) {
          setSection(mapApiHomeTestimonialSection(payload.section));
        }
        const items = (payload.testimonials || []).map(mapApiHomeTestimonial);
        if (items.length > 0) {
          setTestimonials(items);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const headingLines = useMemo(
    () => (section.heading || "").split("\n").filter(Boolean),
    [section.heading],
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 py-16 lg:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl"></div>
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="flex justify-center">
          <span className="rounded-full bg-orange-100 px-6 py-2 text-sm font-semibold text-orange-600 shadow">
            {section.badge}
          </span>
        </div>

        <h2 className="mx-auto mt-6 max-w-4xl text-center text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
          {headingLines.length > 0 ? (
            headingLines.map((line, index) => (
              <React.Fragment key={`${line}-${index}`}>
                {line}
                {index < headingLines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))
          ) : (
            <>
              What Our Happy Customers
              <br />
              Say About Namo Print
            </>
          )}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-center text-gray-600">{section.subtitle}</p>

        <div className="mt-16">
          <Swiper
            modules={[Autoplay]}
            loop={testimonials.length > 1}
            speed={6000}
            grabCursor={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={25}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 1.3 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="group flex h-[430px] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white p-7 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
                  <div className="flex gap-1">
                    {Array.from({ length: item.rating || 5 }, (_, star) => (
                      <Star
                        key={star}
                        size={18}
                        className="fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>

                  <h3 className="mt-6 text-2xl font-bold leading-snug text-gray-900 break-words">
                    {item.title}
                  </h3>

                  <p className="mt-5 flex-1 overflow-hidden break-words text-base leading-7 text-gray-600">
                    &ldquo;{item.review}&rdquo;
                  </p>

                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>

                  <div className="flex items-center gap-4 overflow-hidden">
                    <img
                      src={resolveMediaUrl(item.image)}
                      alt={item.name}
                      className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-orange-300 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-lg font-semibold text-gray-900">{item.name}</h4>
                      <p className="truncate text-sm text-gray-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
