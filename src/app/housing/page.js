// src/app/housing/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import Footer from "@/components/Footer";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

// `value` is what gets stored in the database (English). af/en are display labels.
const LISTING_TYPES = [
  { value: "rent", af: "Te Huur", en: "To Rent", icon: "🔑" },
  { value: "sale", af: "Te Koop", en: "For Sale", icon: "🏷️" },
];

const PROPERTY_TYPES = [
  { value: "House", af: "Huis", en: "House", icon: "🏠" },
  { value: "Flat", af: "Woonstel", en: "Flat / Apartment", icon: "🏢" },
  { value: "Room", af: "Kamer", en: "Room", icon: "🛏️" },
  { value: "Granny flat", af: "Buitekamer", en: "Granny flat / Cottage", icon: "🏡" },
  { value: "Plot", af: "Erf / Plot", en: "Plot / Land", icon: "🌾" },
  { value: "Commercial", af: "Kommersieel", en: "Commercial", icon: "🏪" },
  { value: "Other", af: "Ander", en: "Other", icon: "📦" },
];

function findListingType(raw) {
  return LISTING_TYPES.find((c) => c.value === raw) || null;
}

function findPropertyType(raw) {
  return PROPERTY_TYPES.find((c) => c.value === raw || c.af === raw || c.en === raw) || null;
}

function waLink(number, msg) {
  let digits = (number || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  else if (!digits.startsWith("27")) digits = "27" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

function timeAgo(dateStr, lang) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const units = [
    { s: 31536000, af: "j", en: "y" },
    { s: 2592000, af: "m", en: "mo" },
    { s: 86400, af: "d", en: "d" },
    { s: 3600, af: "u", en: "h" },
    { s: 60, af: "min", en: "m" },
  ];
  for (const u of units) {
    const val = Math.floor(seconds / u.s);
    if (val >= 1) return `${val}${lang === "af" ? u.af : u.en}`;
  }
  return lang === "af" ? "nou" : "now";
}

const text = {
  af: {
    title: "Behuising",
    sub: "Huise, woonstelle en kamers in Brandfort.",
    disclaimer:
      "Alle reëlings gebeur direk tussen jou en die eienaar via WhatsApp — Bulletin is nie deel van enige huur- of koopooreenkoms nie. Besigtig altyd eers voordat jy betaal.",
    privacyNote: "Deur te plaas, stem jy in tot ons",
    privacyLink: "privaatheidsbeleid",
    priceOnRequest: "Prys op aanvraag",
    perMonth: "/maand",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markRented: "Merk as Verhuur",
    markSold: "Merk as Verkoop",
    rented: "VERHUUR",
    sold: "VERKOOP",
    report: "🚩 Rapporteer",
    all: "Alles",
    allTypes: "Alle tipes",
    noListings: "Nog geen eiendomme nie.",
    noListingsFilter: "Geen eiendomme pas by hierdie filter nie.",
    beFirst: "Wees die eerste een!",
    confirmRented: "Merk hierdie eiendom as verhuur?",
    confirmSold: "Merk hierdie eiendom as verkoop?",
    bedShort: "slaapkamer(s)",
    bathShort: "badkamer(s)",
    whatsappMsg: (title) => `Hi, ek het jou eiendom "${title}" op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Housing",
    sub: "Houses, flats and rooms in Brandfort.",
    disclaimer:
      "All arrangements happen directly between you and the owner via WhatsApp — Bulletin isn't part of any rental or sale agreement. Always view the place before you pay anything.",
    privacyNote: "By posting, you agree to our",
    privacyLink: "privacy policy",
    priceOnRequest: "Price on request",
    perMonth: "/month",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markRented: "Mark as Rented",
    markSold: "Mark as Sold",
    rented: "RENTED",
    sold: "SOLD",
    report: "🚩 Report",
    all: "All",
    allTypes: "All types",
    noListings: "No properties yet.",
    noListingsFilter: "No properties match this filter.",
    beFirst: "Be the first!",
    confirmRented: "Mark this property as rented?",
    confirmSold: "Mark this property as sold?",
    bedShort: "bed",
    bathShort: "bath",
    whatsappMsg: (title) => `Hi, I saw your property "${title}" on Ons Brandfort Bulletin`,
  },
};

export default function Housing() {
  const { lang } = useLang();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [propFilter, setPropFilter] = useState("all");

  const t = text[lang];

  useEffect(() => {
    fetchListings();
    const saved = JSON.parse(localStorage.getItem("myHousing") || "[]");
    setMyListings(saved);
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("housing")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });
    if (!error) setListings(data);
    setLoading(false);
  }

  async function markTaken(item) {
    const msg = item.listing_type === "sale" ? t.confirmSold : t.confirmRented;
    if (!confirm(msg)) return;
    const { error } = await supabase.from("housing").update({ is_taken: true }).eq("id", item.id);
    if (!error) fetchListings();
  }

  async function flagListing(id) {
    const flaggedKey = `flagged_housing_${id}`;
    if (localStorage.getItem(flaggedKey)) return;
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const newCount = (listing.flag_count || 0) + 1;
    const { error } = await supabase
      .from("housing")
      .update({ flag_count: newCount, is_hidden: newCount >= 3 })
      .eq("id", id);
    if (!error) {
      localStorage.setItem(flaggedKey, "true");
      fetchListings();
    }
  }

  function priceText(item) {
    if (item.price_on_request) return t.priceOnRequest;
    if (item.price) {
      const base = `R${Number(item.price).toLocaleString("en-ZA")}`;
      return item.listing_type === "rent" ? `${base}${t.perMonth}` : base;
    }
    return null;
  }

  // Only show property-type pills for types that actually have listings
  const presentProps = new Set(
    listings.map((l) => findPropertyType(l.property_type)?.value).filter(Boolean)
  );
  const filterProps = PROPERTY_TYPES.filter((c) => presentProps.has(c.value));

  // Taken items sink to the bottom; order otherwise stays newest-first
  const visible = listings
    .filter((l) => typeFilter === "all" || l.listing_type === typeFilter)
    .filter((l) => propFilter === "all" || findPropertyType(l.property_type)?.value === propFilter)
    .sort((a, b) => Number(!!a.is_taken) - Number(!!b.is_taken));

  const pillClass = (active) =>
    `px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
      active
        ? "bg-sky-500 border-sky-500 text-black font-semibold"
        : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
    }`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header
        className="border-b border-sky-900/60 px-4 pt-6 pb-6"
        style={{
          background: "radial-gradient(circle at 20% 0%, #0c4a6e, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              🏠 <span className="text-sky-400">{t.title}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{t.sub}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-16 flex-1 w-full">
        {/* Disclaimer */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-neutral-300 text-sm">ℹ️ {t.disclaimer}</p>
          <p className="text-neutral-500 text-xs mt-1">
            {t.privacyNote}{" "}
            <Link href="/privacy" className="underline hover:text-sky-400">
              {t.privacyLink}
            </Link>
            .
          </p>
        </div>

        {/* Filters */}
        {!loading && listings.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setTypeFilter("all")} className={pillClass(typeFilter === "all")}>
                {t.all}
              </button>
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => setTypeFilter(lt.value)}
                  className={pillClass(typeFilter === lt.value)}
                >
                  {lt.icon} {lt[lang]}
                </button>
              ))}
            </div>

            {filterProps.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setPropFilter("all")} className={pillClass(propFilter === "all")}>
                  {t.allTypes}
                </button>
                {filterProps.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPropFilter(c.value)}
                    className={pillClass(propFilter === c.value)}
                  >
                    {c.icon} {c[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && <SkeletonList Component={SkeletonPostCard} count={3} />}

        {/* Listings */}
        <div className="space-y-4">
          {visible.map((item) => {
            const prop = findPropertyType(item.property_type);
            const lt = findListingType(item.listing_type);
            const priceStr = priceText(item);
            const isMine = myListings.includes(item.id);
            return (
              <article
                key={item.id}
                className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 ${
                  item.is_taken ? "opacity-50" : ""
                }`}
              >
                {item.image_url && (
                  <div className="relative w-full h-56 mb-3 rounded-xl overflow-hidden bg-neutral-950">
                    <SafeImage
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 600px"
                      className="object-cover"
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          {prop?.icon || "🏠"}
                        </div>
                      }
                    />
                  </div>
                )}

                <div className="flex justify-between items-start gap-3">
                  <h2 className="font-bold text-lg leading-tight break-words min-w-0">
                    {item.title}
                  </h2>
                  {item.is_taken ? (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex-shrink-0">
                      {item.listing_type === "sale" ? t.sold : t.rented}
                    </span>
                  ) : (
                    priceStr && (
                      <span className="text-sky-400 font-black text-lg flex-shrink-0 whitespace-nowrap">
                        {priceStr}
                      </span>
                    )
                  )}
                </div>

                {/* Quick facts */}
                {(item.area || item.bedrooms !== null || item.bathrooms !== null) && (
                  <p className="text-sm text-neutral-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {item.area && <span>📍 {item.area}</span>}
                    {item.bedrooms !== null && item.bedrooms !== undefined && (
                      <span>
                        🛏️ {item.bedrooms === 0 ? "Studio" : item.bedrooms >= 5 ? "5+" : item.bedrooms}
                        {item.bedrooms > 0 ? ` ${t.bedShort}` : ""}
                      </span>
                    )}
                    {item.bathrooms !== null && item.bathrooms !== undefined && (
                      <span>
                        🚿 {item.bathrooms >= 3 ? "3+" : item.bathrooms} {t.bathShort}
                      </span>
                    )}
                  </p>
                )}

                <p className="text-sm text-neutral-300 mt-2 leading-relaxed whitespace-pre-line break-words">
                  {item.description}
                </p>

                <div className="flex items-center flex-wrap gap-2 mt-3">
                  {lt && (
                    <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/40 rounded-full px-2.5 py-0.5">
                      {lt.icon} {lt[lang]}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-full px-2.5 py-0.5">
                    {prop ? `${prop.icon} ${prop[lang]}` : item.property_type}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t.by} {item.name} · {timeAgo(item.created_at, lang)}
                  </span>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap items-center">
                  {!item.is_taken && (
                    <a
                      href={waLink(item.whatsapp, t.whatsappMsg(item.title))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 transition text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      {t.whatsappBtn}
                    </a>
                  )}
                  {isMine && !item.is_taken && (
                    <button
                      onClick={() => markTaken(item)}
                      className="text-sm text-neutral-400 hover:text-white border border-neutral-700 px-4 py-2 rounded-lg"
                    >
                      {item.listing_type === "sale" ? t.markSold : t.markRented}
                    </button>
                  )}
                  <button
                    onClick={() => flagListing(item.id)}
                    className="text-xs text-neutral-600 hover:text-red-400 ml-auto"
                  >
                    {t.report}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && visible.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🏠</div>
            <p className="text-neutral-400 text-sm mb-1">
              {listings.length === 0 ? t.noListings : t.noListingsFilter}
            </p>
            {listings.length === 0 && (
              <Link href="/create/housing" className="text-sky-400 text-sm font-semibold underline">
                {t.beFirst}
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}

