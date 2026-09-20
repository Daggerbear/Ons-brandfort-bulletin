// app/business/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import BusinessReviews from "@/components/BusinessReviews";
import BusinessUpdates from "@/components/BusinessUpdates";
import { trackEvent } from "@/lib/analytics";
import { SkeletonBusinessDetail } from "@/components/Skeleton";
import { getCategoryByName } from "@/lib/categories";

// Finds the first SA phone number in free text; returns digits like 27710978901
function extractNumber(contact) {
  if (!contact) return null;
  const match = contact.match(/(?:\+?27|0)[\d\s()-]{8,}/);
  if (!match) return null;
  let digits = match[0].replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  return digits.length >= 11 && digits.length <= 12 ? digits : null;
}

function getWebsiteLink(website) {
  if (!website) return null;
  if (website.startsWith("http://") || website.startsWith("https://")) return website;
  return `https://${website}`;
}

const text = {
  af: {
    back: "Terug na Kategorie",
    address: "Adres",
    hours: "Ure",
    contact: "Kontak",
    whatsapp: "WhatsApp",
    call: "Bel",
    website: "Webwerf",
    menu: "Spyskaart",
    services: "Dienste",
    openMaps: "Maak oop in Maps →",
    notFound: "Besigheid nie gevind nie.",
    share: "Deel hierdie besigheid",
    sisterBusinesses: "Ook Deur Dieselfde Eienaar",
    waMessage: "Hi, ek het jou op Ons Brandfort Bulletin gekry! Ek wil navrae doen oor ",
    shareMessage: (name, desc, url) =>
      `Kyk na ${name} op Ons Brandfort Bulletin — ${desc}. Sien hul besonderhede hier: ${url}`,
  },
  en: {
    back: "Back to Category",
    address: "Address",
    hours: "Hours",
    contact: "Contact",
    whatsapp: "WhatsApp",
    call: "Call",
    website: "Website",
    menu: "Menu",
    services: "Services",
    openMaps: "Open in Maps →",
    notFound: "Business not found.",
    share: "Share this business",
    sisterBusinesses: "Also By The Same Owner",
    waMessage: "Hi, I found you on Ons Brandfort Bulletin! I'd like to enquire about ",
    shareMessage: (name, desc, url) =>
      `Check out ${name} on Ons Brandfort Bulletin — ${desc}. View their details here: ${url}`,
  },
};

export default function BusinessDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [business, setBusiness] = useState(null);
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [sisterBusinesses, setSisterBusinesses] = useState([]);

  const t = text[lang];

  useEffect(() => {
    const fetchBusiness = async () => {
      const [businessResult, menuResult, updatesResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("business_menu_settings")
          .select("menu_enabled")
          .eq("business_id", id)
          .maybeSingle(),
        supabase
          .from("business_updates")
          .select("*")
          .eq("business_id", id)
          .eq("Status", "approved")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      const biz = businessResult.data;
      setBusiness(biz || null);

      if (biz) {
        trackEvent("business_view", { businessId: biz.id });

        if (biz.sister_group) {
          const { data: sisters } = await supabase
            .from("businesses")
            .select("id, name, category, logo_url")
            .eq("sister_group", biz.sister_group)
            .eq("Status", "approved")
            .neq("id", id);
          setSisterBusinesses(sisters || []);
        }
      }
      setMenuEnabled(menuResult.data?.menu_enabled === true);
      setUpdates(updatesResult.data || []);
      setLoading(false);
    };

    if (id) {
      fetchBusiness();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("business_reviews")
      .select("*")
      .eq("business_id", id)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <SkeletonBusinessDetail />
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-neutral-400 mb-6">{t.notFound}</p>
          <Link href="/besighede" className="text-orange-400 hover:text-orange-300 underline">
            {t.back}
          </Link>
        </div>
      </main>
    );
  }

  const cat = getCategoryByName(business.category);
  const categoryIcon = cat?.icon || "🏪";
  const categoryLabel = cat ? cat[lang] : business.category;
  const categorySlug = cat?.slug || "all";

  const digits = extractNumber(business.contact);
  const whatsappLink = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(t.waMessage)}`
    : null;
  const callLink = digits ? `tel:+${digits}` : null;
  const websiteLink = getWebsiteLink(business.website);

  const mapsLink = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${business.address}, Brandfort, South Africa`
      )}`
    : null;

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://ons-brandfort-bulletin.vercel.app/business/${id}`;
  const shareDesc = business.category || business.description?.slice(0, 60) || "";
  const shareLink = `https://wa.me/?text=${encodeURIComponent(
    t.shareMessage(business.name, shareDesc, shareUrl)
  )}`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      {/* Hero header */}
      <header
        className="border-b border-orange-900/60 px-6 pt-5 pb-7"
        style={{ background: "radial-gradient(circle at 20% 0%, #7c2d12, #0a0a0a 75%)" }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-5">
            <Link
              href={`/besighede/${categorySlug}`}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              ← {t.back}
            </Link>
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-400 hover:text-orange-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <SafeImage
              src={business.logo_url}
              alt={`${business.name} logo`}
              width={88}
              height={88}
              priority
              className="w-[88px] h-[88px] object-cover rounded-2xl border-2 border-orange-500/40 flex-shrink-0"
              fallback={
                <div className="w-[88px] h-[88px] rounded-2xl border-2 border-orange-500/40 bg-neutral-900 flex items-center justify-center text-4xl flex-shrink-0">
                  {categoryIcon}
                </div>
              }
            />
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-orange-400 border border-orange-500/40 rounded-full px-3 py-1 mb-2">
                {categoryIcon} {categoryLabel}
              </span>
              <h1 className="text-2xl font-bold leading-tight break-words">{business.name}</h1>
              {averageRating && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </span>
                  <span className="text-neutral-400 text-xs">
                    {averageRating} ({reviews.length})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8 w-full flex-1">
        {/* Action bar */}
        <div className="space-y-3 mb-8">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg px-4 py-3"
            >
              💬 {t.whatsapp}
            </a>
          )}
          <div className="grid grid-cols-2 gap-3">
            {callLink && (
              <a
                href={callLink}
                className="last:odd:col-span-2 text-center border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition font-semibold rounded-lg px-4 py-3"
              >
                📞 {t.call}
              </a>
            )}
            {menuEnabled && (
              <a
                href={`/business/${business.id}/menu`}
                className="last:odd:col-span-2 text-center bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3"
              >
                📋 {t.menu}
              </a>
            )}
            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="last:odd:col-span-2 text-center bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition text-white font-semibold rounded-lg px-4 py-3"
              >
                🌐 {t.website}
              </a>
            )}
          </div>
        </div>

        <p className="text-neutral-300 mb-6 leading-relaxed whitespace-pre-line break-words">
          {business.description}
        </p>

        {/* Services */}
        {business.services?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-3">
              🛠️ {t.services}
            </h2>
            <div className="flex flex-wrap gap-2">
              {business.services.map((s) => (
                <span
                  key={s}
                  className="text-sm bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-3 py-1 capitalize"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sister Businesses */}
        {sisterBusinesses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-3">
              👥 {t.sisterBusinesses}
            </h2>
            <div className="flex flex-col gap-2">
              {sisterBusinesses.map((sister) => {
                const sCat = getCategoryByName(sister.category);
                return (
                  <Link
                    key={sister.id}
                    href={`/business/${sister.id}`}
                    className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-3"
                  >
                    <SafeImage
                      src={sister.logo_url}
                      alt={sister.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                      fallback={
                        <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center text-xl flex-shrink-0">
                          {sCat?.icon || "🏪"}
                        </div>
                      }
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{sister.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {sCat ? sCat[lang] : sister.category}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {business.address && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-3 col-span-2"
            >
              <p className="text-xs text-neutral-500 uppercase mb-1">📍 {t.address}</p>
              <p className="text-white text-sm">{business.address}</p>
              <p className="text-xs text-orange-400 mt-1">{t.openMaps}</p>
            </a>
          )}
          {business.hours && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs text-neutral-500 uppercase mb-1">🕒 {t.hours}</p>
              <p className="text-white text-sm">{business.hours}</p>
            </div>
          )}
          {business.contact && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs text-neutral-500 uppercase mb-1">📞 {t.contact}</p>
              <p className="text-white text-sm break-words">{business.contact}</p>
            </div>
          )}
        </div>

        <BusinessUpdates updates={updates} lang={lang} />

        <BusinessReviews
          businessId={id}
          reviews={reviews}
          lang={lang}
          onPosted={fetchReviews}
        />

        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-neutral-400 hover:text-orange-400 border border-neutral-800 hover:border-orange-500/50 transition rounded-lg px-4 py-3 mt-6"
        >
          <span>📤</span>
          {t.share}
        </a>
      </div>

      <Footer lang={lang} />
    </main>
  );
}