import {
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiChevronUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { BrandHomeLink } from "./BrandLogo";
import { resolveCategoryLink } from "../../config/categoryRoutes";

// export default function Footer() {
//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };
const socialLinks = [
  {
    icon: <FiFacebook />,
    url: "https://www.facebook.com/share/19Acuco8uY/",
  },
  {
    icon: <FiInstagram />,
    url: "https://www.instagram.com/namoprint_official?igsh=MTNnOWxtOWljbzBnYw==",
  },
  {
    icon: <FiYoutube />,
    url: "https://youtube.com/@namoprints-j1l?si=xKzKzvh7uMov4trE",
  },
];
export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative bg-gradient-to-r from-[#0A1023] via-[#24104A] to-[#0A1023] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        {/* Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company */}
          <div>
            <BrandHomeLink className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center font-bold text-2xl">
                N
              </div>

              <h2 className="text-3xl font-bold">
                Namo <span className="font-semibold">Print</span>
              </h2>
            </BrandHomeLink>

            <p className="text-gray-300 leading-9 text-base">
              India's trusted online printing partner for T-Shirts, Photo
              Frames, Mugs, Stickers, Corporate Gifts, Packaging Boxes and
              Custom Printing Solutions.
            </p>

            <div className="flex items-center gap-4 mt-10">
  {socialLinks.map((item, index) => (
    <a
      key={index}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl hover:bg-red-500 hover:border-red-500 transition-all duration-300"
    >
      {item.icon}
    </a>
  ))}
</div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Categories</h3>

            <div className="flex flex-col gap-4 text-gray-300">
              <Link
                to={resolveCategoryLink("acrylic-wall-photo")}
                className="hover:text-orange-400 transition"
              >
                Acrylic Products
              </Link>

              <Link
                to="/god-photo-frames"
                className="hover:text-orange-400 transition"
              >
                God Photo Frames
              </Link>

              <Link
                to="/name-plates"
                className="hover:text-orange-400 transition"
              >
                Name Plates
              </Link>

              <Link
                to="/pen-print"
                className="hover:text-orange-400 transition"
              >
                Pen Print
              </Link>

              <Link
                to={resolveCategoryLink("logo-stickers")}
                className="hover:text-orange-400 transition"
              >
                QR Standees
              </Link>

              <Link
                to="/uv-dtf-stickers"
                className="hover:text-orange-400 transition"
              >
                UV DTF Stickers
              </Link>

              <Link
                to="/product-label-stickers"
                className="hover:text-orange-400 transition"
              >
                Product Labels
              </Link>

              <Link
                to="/trophies"
                className="hover:text-orange-400 transition"
              >
                Trophies &amp; Mementos
              </Link>

              <Link
                to="/baby-birth-frames"
                className="hover:text-orange-400 transition"
              >
                Baby Birth Frames
              </Link>

              <Link
                to="/corporate-gifts"
                className="hover:text-orange-400 transition"
              >
                Corporate Gifts
              </Link>

              <Link
                to="/t-shirt-printing"
                className="hover:text-orange-400 transition"
              >
                T-Shirts
              </Link>

              <Link
                to="/custom-wall-watches"
                className="hover:text-orange-400 transition"
              >
                Wall Watches
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>

            <div className="flex flex-col gap-4 text-gray-300">
              <Link to="/about" className="hover:text-orange-400 transition">
                About Us
              </Link>

              <Link to="/contact" className="hover:text-orange-400 transition">
                Contact Us
              </Link>

              <Link
                to="/bulk-orders"
                className="hover:text-orange-400 transition"
              >
                Bulk Orders
              </Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Policies</h3>

            <div className="flex flex-col gap-4 text-gray-300">
              <Link
                to="/privacy-policy"
                className="hover:text-orange-400 transition"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms-and-conditions"
                className="hover:text-orange-400 transition"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/refund-policy"
                className="hover:text-orange-400 transition"
              >
                Refund Policy
              </Link>

              <Link
                to="/shipping-policy"
                className="hover:text-orange-400 transition"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-16 pt-8 relative">
          {/* Bottom */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <p className="text-gray-400 text-center lg:text-left">
              © 2026{" "}
              <span className="text-white font-semibold">Namo Print</span>. All
              Rights Reserved.
            </p>

            {/* Scroll Button */}
            <button
              onClick={scrollToTop}
              className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 transition flex items-center justify-center text-3xl shadow-lg"
            >
              <FiChevronUp />
            </button>

            {/* Bottom Links */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <Link className="hover:text-white transition" to="/faq">
                FAQs
              </Link>

              <Link className="hover:text-white transition" to="/terms-and-conditions">
                Terms
              </Link>

              <Link className="hover:text-white transition" to="/privacy-policy">
                Privacy
              </Link>

              <Link className="hover:text-white transition" to="/contact">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
