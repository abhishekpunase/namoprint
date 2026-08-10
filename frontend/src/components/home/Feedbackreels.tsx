"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Volume2,
    Heart,
    MessageCircle,
    Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { DEFAULT_PRODUCT_REELS, mapApiProductReel } from "../../data/defaultProductReels";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function ReelCard({ item, index }: { item: ReturnType<typeof mapApiProductReel>; index: number }) {
    const videoSrc = resolveMediaUrl(item.video);
    const posterSrc = item.poster ? resolveMediaUrl(item.poster) : undefined;

    const card = (
        <motion.div
            initial={{ opacity: 0, y: 70 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                duration: .6,
                delay: index * .15,
            }}
            viewport={{ once: true }}
            whileHover={{
                y: -10,
                scale: 1.03,
            }}
            className="group relative h-[420px] overflow-hidden rounded-[28px] shadow-xl"
        >
            <video
                src={videoSrc}
                poster={posterSrc}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />

            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
                <Volume2 size={18} className="text-white" />
            </div>

            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-5">
                <button type="button" className="rounded-full bg-black/40 p-2 backdrop-blur">
                    <Heart size={20} className="text-white" />
                </button>

                <span className="text-xs font-semibold text-white">
                    {item.likes}
                </span>

                <button type="button" className="rounded-full bg-black/40 p-2 backdrop-blur">
                    <MessageCircle size={20} className="text-white" />
                </button>

                <button type="button" className="rounded-full bg-black/40 p-2 backdrop-blur">
                    <Share2 size={20} className="text-white" />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-5">
                <p className="text-sm text-white/80">
                    {item.title}
                </p>

                <h3 className="font-semibold text-white">
                    {item.product}
                </h3>

                <p className="mt-1 text-xl font-bold text-white">
                    {item.price}
                </p>
            </div>
        </motion.div>
    );

    if (item.linkUrl) {
        return (
            <Link to={item.linkUrl} className="block">
                {card}
            </Link>
        );
    }

    return card;
}

export default function FeedbackReels() {
    const [remoteReels, setRemoteReels] = useState<ReturnType<typeof mapApiProductReel>[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        api
            .productReels()
            .then((payload) => {
                if (cancelled) return;
                const items = (payload.reels || []).map(mapApiProductReel);
                setRemoteReels(items.length ? items : []);
            })
            .catch(() => {
                if (!cancelled) setRemoteReels([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const reels = useMemo(() => {
        if (remoteReels === null) return DEFAULT_PRODUCT_REELS.map(mapApiProductReel);
        if (remoteReels.length) return remoteReels;
        return DEFAULT_PRODUCT_REELS.map(mapApiProductReel);
    }, [remoteReels]);

    return (
        <section className="bg-[#f8f6f3] py-24">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: .7 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <p className="text-sm font-bold uppercase tracking-[4px] text-yellow-500">
                        Watch & Shop
                    </p>

                    <h2 className="mt-3 text-5xl font-bold text-slate-900">
                        Products{" "}
                        <span className="italic text-yellow-500">
                            Reels
                        </span>
                    </h2>

                    <p className="mt-4 text-slate-500">
                        See our products in action
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {reels.map((item, index) => (
                        <ReelCard
                            key={item._id || `${item.product}-${index}`}
                            item={item}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
