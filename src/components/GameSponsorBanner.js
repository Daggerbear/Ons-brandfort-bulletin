"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function GameSponsorBanner({ gameSlug }) {
  const [sponsor, setSponsor] = useState(null);

  useEffect(() => {
    async function fetchSponsor() {
      const { data, error } = await supabase
        .from("game_sponsors")
        .select("*, businesses(*)")
        .eq("game_slug", gameSlug)
        .eq("active", true)
        .maybeSingle();

      if (!error) setSponsor(data);
    }
    fetchSponsor();
  }, [gameSlug]);

  if (!sponsor) return null;

  const business = sponsor.businesses;
  const name = business?.name || sponsor.custom_name;
  const description = business?.description || sponsor.custom_description;
  const displayImage = sponsor.custom_image_url || business?.logo_url;
  const hasCustomFlyer = !!sponsor.custom_image_url;
  const linkHref = business ? `/business/${business.id}` : "#";

  return (
    <Link
      href={linkHref}
      className="block bg-neutral-950/90 border-2 border-orange-500 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/50 transition mt-8 mx-auto"
      style={{ width: "min(90vw, 384px)" }}
    >
      {displayImage && (
        <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
          <Image
            src={displayImage}
            alt={name}
            fill
            sizes="384px"
            className="object-contain"
          />
        </div>
      )}

      {!hasCustomFlyer && (
        <div className="p-3">
          <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold uppercase tracking-wide">
            Game Sponsor
          </span>
          <h3 className="text-base font-bold text-orange-400 mt-2">{name}</h3>
          {description && (
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      )}
    </Link>
  );
}