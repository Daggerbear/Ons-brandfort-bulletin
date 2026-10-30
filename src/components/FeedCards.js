// src/components/FeedCards.js
"use client";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

// One card style for Buy & Sell, Housing and Jobs
export function ListingCard({ href, icon, tag, tagClass, title, meta, price, image, ago }) {
  const placeholder = (
    <div className="flex h-full w-full items-center justify-center text-3xl">{icon}</div>
  );
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-orange-500"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
        {image ? (
          <SafeImage
            src={image}
            alt={title || ""}
            fill
            sizes="80px"
            className="object-cover"
            fallback={placeholder}
          />
        ) : (
          placeholder
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wide ${tagClass}`}>
              {tag}
            </span>
            <span className="text-[11px] text-neutral-500">{ago}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white">{title}</p>
          {meta && <p className="mt-0.5 truncate text-xs text-neutral-400">{meta}</p>}
        </div>
        {price && <p className="text-sm font-bold text-orange-400">{price}</p>}
      </div>
    </Link>
  );
}

export function AdCard({ ad, lang = "af" }) {
  const href = ad.business_id ? `/business/${ad.business_id}` : "/besighede";
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-orange-500"
    >
      <p className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-white">{ad.business_name}</span>
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">
          {lang === "af" ? "Geborg" : "Sponsored"}
        </span>
      </p>
      <SafeImage
        src={ad.image_url}
        alt={ad.business_name || ""}
        width={800}
        height={400}
        className="w-full rounded-xl object-cover"
      />
    </Link>
  );
}

export function EventTile({ event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-orange-500"
    >
      <div className="relative h-20 w-full bg-gradient-to-br from-orange-900 to-neutral-900">
        {event.image_url && (
          <SafeImage
            src={event.image_url}
            alt={event.title || ""}
            fill
            sizes="160px"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-sm font-semibold text-white">{event.title}</p>
        <p className="mt-1 truncate text-[11px] text-neutral-400">
          {event.date} {event.time && `· ${event.time}`}
        </p>
      </div>
    </Link>
  );
}