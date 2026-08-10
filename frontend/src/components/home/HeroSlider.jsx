import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    badge: "Premium Printing Service",

    title: "Create Amazing\nCustom Gifts",

    description:
      "Upload your photo and personalize Acrylic Frames, Wall Clocks, Name Plates, Keychains, LED Frames and many more premium products.",

    button: "Start Designing",

    image:
      "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ft-shirt-3.856e3532.png&w=1920&q=75",

    cap:
      "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcap.03620841.png&w=640&q=75",

    bucket:
      "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbucket-front-color.a2dc9801.png&w=640&q=75",

    sticker:
      "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstiker.761204e9.png&w=640&q=75",

    card:
      "https://prinoz-next.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmockup-generator.a5b73818.png&w=750&q=75",
  },
];

export default function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, EffectFade]}
      effect="fade"
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      loop
    >
      {slides.map((item, index) => (
        <SwiperSlide key={index}>
          <section className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-indigo-100 to-slate-100">

            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-pink-300/30 blur-[120px]" />

            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-300/30 blur-[140px]" />

            <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col items-center justify-between px-6 py-20 lg:flex-row">

              <div className="z-20 max-w-xl text-center lg:text-left">

                <span className="rounded-full bg-red-500 px-6 py-3 text-white font-semibold">
                  {item.badge}
                </span>

                <h1 className="mt-8 text-5xl font-extrabold lg:text-7xl">
                  {item.title.split("\n").map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </h1>

                <div className="mt-4 h-2 w-36 rounded-full bg-yellow-400"></div>

                <p className="mt-8 text-lg text-gray-600 leading-8">
                  {item.description}
                </p>

                <Link
                  to="/products"
                  className="inline-block mt-10 rounded-full bg-black px-10 py-4 text-lg font-semibold text-white hover:bg-red-500 duration-300"
                >
                  {item.button}
                </Link>
              </div>

              <div className="relative mt-20 flex h-[650px] w-full items-center justify-center lg:w-1/2">

                <div className="absolute h-[520px] w-[520px] rounded-full bg-white shadow-2xl"></div>

                <img
                  src={item.image}
                  alt=""
                  className="relative z-20 w-[280px] md:w-[420px] lg:w-[520px] animate-bounce"
                  style={{
                    animationDuration: "4s",
                  }}
                />

                <img
                  src={item.sticker}
                  alt=""
                  className="absolute right-10 top-0 w-24 md:w-36 animate-pulse"
                />

                <img
                  src={item.bucket}
                  alt=""
                  className="absolute left-0 top-10 w-40 md:w-48 animate-[bounce_5s_infinite]"
                />

                <img
                  src={item.cap}
                  alt=""
                  className="absolute bottom-10 right-0 w-32 md:w-48 animate-[bounce_6s_infinite]"
                />

                <img
                  src={item.card}
                  alt=""
                  className="absolute bottom-4 left-0 w-56 md:w-72 rounded-xl shadow-xl animate-[bounce_4s_infinite]"
                />
              </div>
            </div>
          </section>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}