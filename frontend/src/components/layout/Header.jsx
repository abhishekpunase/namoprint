import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiHeart,
  FiLogOut,
  FiTruck,
  FiGift,
  FiPercent,
  FiChevronDown,
} from "react-icons/fi";
import logo from "../../assets/logo-namo.jpeg";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

const primaryNavItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/god-photo-frames", label: "God Frame" },
  { to: "/name-plates", label: "Name Plate" },
  { to: "/baby-birth-frames", label: "Baby Frames" },
  { to: "/t-shirt-printing", label: "T-Shirt Print" },
  { to: "/custom-wall-watches", label: "Wall Watches" },
];

const moreNavItems = [
  { to: "/pen-print", label: "Pen Print" },
  { to: "/uv-dtf-stickers", label: "UV DTF Stickers" },
  { to: "/product-label-stickers", label: "Product Labels" },
  { to: "/corporate-gifts", label: "Corporate Gifts" },
  { to: "/trophies", label: "Trophies" },
];

const navItems = [...primaryNavItems, ...moreNavItems];

const navLinkClass = ({ isActive }) =>
  `relative shrink-0 whitespace-nowrap px-1 pb-1.5 text-xs font-medium transition duration-300 xl:text-[13px] ${
    isActive ? "text-[#F5B400]" : "text-gray-800 hover:text-[#F5B400]"
  }`;

const offers = [
  {
    icon: <FiTruck />,
    text: "Free Shipping on Orders Above ₹999",
  },
  {
    icon: <FiPercent />,
    text: "Flat 10% OFF on First Order",
  },
  {
    icon: <FiGift />,
    text: "Bulk Orders? Get Special Corporate Discounts",
  },
   {
    icon: <FiTruck />,
    text: "Free Shipping on Orders Above ₹999",
  },
  {
    icon: <FiPercent />,
    text: "Flat 10% OFF on First Order",
  },
  {
    icon: <FiGift />,
    text: "Bulk Orders? Get Special Corporate Discounts",
  },
   {
    icon: <FiTruck />,
    text: "Free Shipping on Orders Above ₹999",
  },
  {
    icon: <FiPercent />,
    text: "Flat 10% OFF on First Order",
  },
  {
    icon: <FiGift />,
    text: "Bulk Orders? Get Special Corporate Discounts",
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const { isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();

  const marqueeItems = [...offers, ...offers];
  const isMoreActive = moreNavItems.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    if (!moreOpen) return undefined;
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  return (
    <>
      {/* Top Announcement Bar */}

  <div className="overflow-hidden bg-gradient-to-l from-black via-zinc-900 to-yellow-700  text-white" >
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, index) => (
            <div
              key={index}
              className="flex min-w-max items-center gap-2 px-8 py-2 text-xs font-medium md:px-12 md:text-sm"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header */}

<header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
  <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-2 px-4 sm:h-20 sm:gap-3 sm:px-6">
    {/* Logo — left */}
    <Link
      to="/"
      aria-label="Namo Prints — go to home"
      className="shrink-0 transition hover:opacity-90"
    >
      <img
        src={logo}
        alt="Namo Prints"
        className="h-10 w-auto object-contain sm:h-11 md:h-12"
      />
    </Link>

    {/* Nav — flex middle (no absolute overlap) */}
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-x-1 lg:flex xl:gap-x-2"
      aria-label="Main navigation"
    >
      {primaryNavItems.map((item) => (
        <NavLink key={item.to} to={item.to} className={navLinkClass}>
          {({ isActive }) => (
            <>
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#F5B400]" />
              )}
            </>
          )}
        </NavLink>
      ))}

      {moreNavItems.length > 0 && (
        <div ref={moreRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className={`relative flex items-center gap-0.5 whitespace-nowrap px-1 pb-1.5 text-xs font-medium transition duration-300 xl:text-[13px] ${
              isMoreActive || moreOpen
                ? "text-[#F5B400]"
                : "text-gray-800 hover:text-[#F5B400]"
            }`}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            More
            <FiChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? "rotate-180" : ""}`} />
            {isMoreActive && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#F5B400]" />
            )}
          </button>

          {moreOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-3 min-w-[12.5rem] -translate-x-1/2 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-[#FFF8E1] font-semibold text-[#F5B400]"
                        : "text-gray-800 hover:bg-gray-50 hover:text-[#F5B400]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>

    {/* Actions — right */}
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0 lg:gap-4 xl:gap-5">
      <Link
        to="/wishlist"
        className="relative text-xl text-gray-800 transition hover:text-[#F5B400] sm:text-2xl"
        aria-label="Wishlist"
      >
        <FiHeart />

        {wishlistCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        to="/cart"
        className="relative text-xl text-gray-800 transition hover:text-[#F5B400] sm:text-2xl"
        aria-label="Cart"
      >
        <FiShoppingBag />

        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5B400] text-[10px] font-bold text-black">
            {count}
          </span>
        )}
      </Link>

      {/* Login / Logout */}
      {isAuthenticated ? (
        <button
          onClick={logout}
          className="hidden items-center rounded-full border border-[#F5B400] px-3 py-1.5 text-xs font-medium text-[#F5B400] transition hover:bg-[#F5B400] hover:text-black lg:flex xl:px-4 xl:py-2 xl:text-sm"
        >
          <FiLogOut className="mr-1.5 xl:mr-2" />
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          className="hidden rounded-full bg-[#F5B400] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#D89B00] lg:block xl:px-5 xl:py-2.5 xl:text-sm"
        >
          Login
        </Link>
      )}

      {/* Mobile Menu */}
      <button
        onClick={() => setOpen(!open)}
        className="text-2xl text-gray-800 transition hover:text-[#F5B400] sm:text-3xl lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  <div
    className={`overflow-hidden border-t border-gray-200 bg-white transition-all duration-300 lg:hidden ${
      open ? "max-h-[500px]" : "max-h-0"
    }`}
  >
    <div className="space-y-2 px-6 py-5">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 transition ${
              isActive
                ? "bg-[#F5B400] text-black font-semibold"
                : "text-gray-800 hover:bg-[#FFF8E1] hover:text-[#F5B400]"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}

      <Link
        to="/wishlist"
        onClick={() => setOpen(false)}
        className="flex items-center justify-between rounded-lg px-4 py-3 text-gray-800 transition hover:bg-[#FFF8E1] hover:text-[#F5B400]"
      >
        Wishlist
        {wishlistCount > 0 && (
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
            {wishlistCount}
          </span>
        )}
      </Link>

      {isAuthenticated ? (
        <button
          onClick={() => {
            logout();
            setOpen(false);
          }}
          className="w-full rounded-lg border border-[#F5B400] py-3 text-[#F5B400] transition hover:bg-[#F5B400] hover:text-black"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          onClick={() => setOpen(false)}
          className="block rounded-lg  py-3 text-center font-semibold text-black bg-[#F5B400] transition hover:bg-[#D89B00]"
        >
          Login
        </Link>
      )}
    </div>
  </div>
</header>
    </>
  );
}