// import BrandSlider from "../components/home/BrandSlider";
import ShopByCategory from "../components/Category/ShopByCategory";
import CategorySection from "../components/home/CategorySection";
import FeedbackReels from "../components/home/Feedbackreels";
import HeroSection from "../components/home/HeroSection";
import Process from "../components/home/ProcessSection";
import ProductHome from "../components/home/ProductHome";
import SpecialOffers from "../components/home/SpecialOffers";
import Testimonial from "../components/home/Testimonial";
// NEW: God Photo Frame home teaser section (standalone)
import GodHomeSection from "../components/home/GodHomeSection";
// import TrustStrip from "../components/home/TrustStrip";
// import CategorySection from "../components/home/CategorySection";
// import FeaturedProducts from "../components/home/FeaturedProducts";
// import ProcessSection from "../components/home/ProcessSection";
// import Testimonials from "../components/home/Testimonials";
// import FAQ from "../components/home/FAQ";

export function HomePage() {
  return (
    <>
      <HeroSection />
      {/* <BrandSlider /> */}
      <Process />
      <CategorySection/>
      {/* <ShopByCategory/> */}
      <ProductHome />
      {/* NEW: God Photo Frame teaser section */}
      <GodHomeSection />
      <SpecialOffers/>
      <FeedbackReels/>
      <Testimonial />
      

      {/* <TrustStrip /> */}

      {/* <CategorySection /> */}

      {/* <FeaturedProducts /> */}

      {/* <ProcessSection /> */}

      {/* Future Sections */}

      {/* <Testimonials /> */}

      {/* <FAQ /> */}
    </>
  );
}