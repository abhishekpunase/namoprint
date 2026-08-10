"use client";

import { motion } from "framer-motion";
import { Gift, Percent, Truck, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HOME_OFFERS, storeCoupon } from "../../data/coupons";
import { useAuth } from "../../hooks/useAuth";

const iconMap = {
  percent: Percent,
  gift: Gift,
  truck: Truck,
};

export default function SpecialOffers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const claimOffer = (offer) => {
    if (offer.code) storeCoupon(offer.code);
    if (!user) {
      navigate("/login", { state: { from: "/checkout", coupon: offer.code } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <section className="relative overflow-hidden bg-[#faf7f5] py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-200 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-yellow-200 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600">
            <Sparkles size={16} />
            Limited Time Exclusive Deals
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Unlock Premium
            <span className="block text-orange-500">Furniture Savings</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Transform your space with handcrafted furniture and enjoy exclusive offers designed especially for you.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {HOME_OFFERS.map((offer, index) => {
            const Icon = iconMap[offer.icon] || Gift;

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                whileHover={{ y: -15, scale: 1.03 }}
                className={`group relative overflow-hidden rounded-[35px] bg-gradient-to-br ${offer.gradient} p-8 shadow-2xl`}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5"
                />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl">
                  <Icon size={40} className="text-white" />
                </div>

                <div className="relative mt-8">
                  <p className="text-orange-100 font-medium uppercase tracking-widest">{offer.subtitle}</p>
                  <h3 className="mt-3 text-4xl font-extrabold text-white">{offer.title}</h3>
                  <p className="mt-5 leading-7 text-white/85">{offer.description}</p>
                </div>

                {offer.code && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mt-8 inline-flex items-center rounded-xl border border-dashed border-white/50 bg-white/15 px-5 py-3 backdrop-blur-xl"
                  >
                    <span className="text-sm">Coupon</span>
                    <span className="ml-3 text-lg font-bold tracking-widest">{offer.code}</span>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  onClick={() => claimOffer(offer)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ x: 5 }}
                  className="mt-10 flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-orange-600 transition-all group-hover:shadow-xl"
                >
                  Claim Offer
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
