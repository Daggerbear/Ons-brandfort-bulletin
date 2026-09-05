"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function FeaturedCarousel({ lang }) {
  const [featured, setFeatured] = useState([]);
  const [index, setIndex] = useState(0);

  const text = {
    af: {
      label: "Uitgelig: Plaaslike Besighede",
      sponsored: "Geborg",
      cta: "Klik om die besigheid te bekyk",
      empty: "Wil jy hier wees? Kontak Jaco om jou besigheid uit te lig.",
      featured: "Uitgelig",
    },
    en: {
      label: "Featured Local Businesses",
      sponsored: "Sponsored",
      cta: "Click to view business",
      empty: "Want to be here? Contact Jaco to feature your business.",
      featured: "Featured",
    },
  };
  const t = text[lang] || text.af;

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured, index]);

  async function fetchFeatured() {
    const { data, error } = await supabase
      .from("featured_businesses")
      .select("*, businesses(*)")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (!error) setFeatured(data);
  }

  function goPrev() {
    setIndex((prev) => (prev - 1 + featured.length) % featured.length);
  }

  function goNext() {
    setIndex((prev) => (prev + 1) % featured.length);
  }

  if (featured.length === 0) {
    return (
      <section className="w-full bg-neutral-950 border-y border-neutral-800 py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              {t.label}
            </h2>
          </div>
          <div className="bg-neutral-900 border border-dashed border-neutral-700 rounded-2xl p-6 text-center">
            <p className="text-neutral-400 text-sm">{t.empty}</p>
          </div>
        </div>
      </section>
    );
  }

  const current = featured[index];
  if (!current) return null;

  const business = current.businesses;
  const name = business?.name || current.custom_name;
  const description = business?.description || current.custom_description;
  const displayImage = current.custom_image_url || business?.logo_url;
  const hasCustomFlyer = !!current.custom_image_url;
  const linkHref = business ? `/business/${business.id}` : "#";

  return (
    <section className="w-full bg-neutral-950 border-y border-neutral-800 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
            {t.label}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-500 uppercase tracking-wide">
            {t.sponsored}
          </span>
        </div>

        <Link
          href={linkHref}
          className="block relative bg-neutral-900 border border-orange-500/60 rounded-2xl overflow-hidden transition hover:border-orange-500"
          style={{ boxShadow: "0 0 32px rgba(249,115,22,0.18)" }}
        >
          {displayImage && (
            <div className="relative w-full bg-black" style={{ aspectRatio: "3 / 2" }}>
              <Image
                src={displayImage}
                alt={name}
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-contain"
              />
            </div>
          )}

          {!hasCustomFlyer && (
            <div className="p-4 pt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold">
                {t.featured}
              </span>
              <h3 className="text-lg font-semibold text-orange-400 mt-2">{name}</h3>
              {description && (
                <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{description}</p>
              )}
            </div>
          )}
        </Link>

        {featured.length > 1 && (
          <div className="flex flex-col items-center gap-1.5 mt-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                aria-label="Previous"
                className="text-neutral-500 hover:text-orange-400 text-xl px-2"
              >
                ‹
              </button>

              <div className="flex gap-2">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      i === index ? "bg-orange-500" : "bg-neutral-700"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                aria-label="Next"
                className="text-neutral-500 hover:text-orange-400 text-xl px-2"
              >
                ›
              </button>
            </div>
            <p className="text-xs text-neutral-600 tabular-nums">
              {index + 1} / {featured.length}
            </p>
            <p className="text-xs text-neutral-500">{t.cta}</p>
          </div>
        )}

        {featured.length === 1 && (
          <p className="text-xs text-neutral-500 text-center mt-3">{t.cta}</p>
        )}
      </div>
    </section>
  );
}