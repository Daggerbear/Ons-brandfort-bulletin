"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function FeaturedCarousel({ lang }) {
  const [featured, setFeatured] = useState([]);
  const [index, setIndex] = useState(0);

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
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-neutral-900 border border-dashed border-neutral-700 rounded-xl p-6 text-center">
          <p className="text-neutral-400 text-sm">
            {lang === "af"
              ? "Wil jy hier wees? Kontak Jaco om jou besigheid uit te lig."
              : "Want to be here? Contact Jaco to feature your business."}
          </p>
        </div>
      </div>
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
    <div className="max-w-2xl mx-auto px-6 py-6">
      <Link
        href={linkHref}
        className="block bg-neutral-900 border border-orange-500 rounded-xl overflow-hidden hover:opacity-90 transition"
      >
        {displayImage && (
          <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
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
          <div className="p-4">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold">
              {lang === "af" ? "Uitgelig" : "Featured"}
            </span>
            <h3 className="text-lg font-semibold text-orange-400 mt-2">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        )}
      </Link>

      {featured.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="text-neutral-400 hover:text-orange-400 text-xl px-2"
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
            className="text-neutral-400 hover:text-orange-400 text-xl px-2"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}