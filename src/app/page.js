// src/app/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import LiveTicker from "@/components/LiveTicker";
import InstallButton from "@/components/InstallButton";
import SiteReviews from "@/components/SiteReviews";
import WeatherWidget from "@/components/WeatherWidget";
import { trackEvent } from "@/lib/analytics";

const BUSINESS_FALLBACK = {
  background:
    "repeating-linear-gradient(135deg, #431407, #431407 10px, #7c2d12 10px, #7c2d12 20px)",
};
const COMMUNITY_FALLBACK = {
  background: "radial-gradient(circle at 30% 20%, #14532d, #052e16 70%)",
};
const EMERGENCY_FALLBACK = {
  background:
    "repeating-linear-gradient(135deg, #000, #000 14px, #991b1b 14px, #991b1b 28px)",
};

function ZoneBackground({ url, fallbackStyle, overlayClass }) {
  return (
    <>
      <div className="absolute inset-0" style={fallbackStyle} />
      {url && (
        <SafeImage
          src={url}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className={`absolute inset-0 ${overlayClass}`} />
    </>
  );
}

export default function Home() {
  const [lang, setLang] = useState("af");
  const [events, setEvents] = useState([]);
  const [heroUrl, setHeroUrl] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [businessBgUrl, setBusinessBgUrl] = useState(null);
  const [communityBgUrl, setCommunityBgUrl] = useState(null);
  const [emergencyBgUrl, setEmergencyBgUrl] = useState(null);
  const [businessCount, setBusinessCount] = useState(null);
  const [eventCount, setEventCount] = useState(null);

  const text = {
    af: {
      tagline: "Die hart van Brandfort, op een plek.",
      events: "🔥 Wat Gebeur",
      statBusinesses: "Besighede Gelys",
      statEvents: "Gebeurtenisse",
      businessZone: "Besigheid",
      businessNote: "Alles wat plaaslike besighede laat groei.",
      communityZone: "Gemeenskap",
      communityNote: "Waar Brandfort saam lewe, deel en groei.",
      emergency: "Nood Kontakte",
      emergencyNote: "Belangrike nommers wanneer dit saak maak.",
    },
    en: {
      tagline: "The heart of Brandfort, in one place.",
      events: "🔥 What's Happening",
      statBusinesses: "Businesses Listed",
      statEvents: "Events",
      businessZone: "Business",
      businessNote: "Everything that helps local business grow.",
      communityZone: "Community",
      communityNote: "Where Brandfort lives, shares, and grows together.",
      emergency: "Emergency Contacts",
      emergencyNote: "Important numbers when it matters.",
    },
  };

  const t = text[lang];

  const businessLinks = [
    { icon: "🏪", label: { af: "Besighede", en: "Businesses" }, href: "/besighede" },
    { icon: "📢", label: { af: "Opdaterings", en: "Updates" }, href: "/business-updates" },
    { icon: "🔎", label: { af: "Vind", en: "Find" }, href: "/vind" },
    { icon: "💼", label: { af: "Werk", en: "Jobs" }, href: "/jobs" },
  ];

  const communityLinks = [
    { icon: "💬", label: { af: "Feed", en: "Feed" }, href: "/feed" },
    { icon: "🛒", label: { af: "Koop/Verkoop", en: "Buy/Sell" }, href: "/classifieds" },
    { icon: "🕹️", label: { af: "Glitch Cafe", en: "Glitch Cafe" }, href: "/games" },
    { icon: "📅", label: { af: "Lys Gebeurtenis", en: "List Event" }, href: "/list-your-event" },
  ];

  const emergencyLinks = [
    { icon: "🚓", label: { af: "Polisie", en: "Police" } },
    { icon: "🚑", label: { af: "Ambulans", en: "Ambulance" } },
    { icon: "🚒", label: { af: "Brandweer", en: "Fire" } },
    { icon: "🏥", label: { af: "Hospitaal", en: "Hospital" } },
  ];

  useEffect(() => {
    const loadData = async () => {
      trackEvent("page_view");

      const { data: eventData, count: evCount } = await supabase
        .from("events")
        .select("*", { count: "exact" })
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setEvents(eventData || []);
      setEventCount(evCount ?? eventData?.length ?? 0);

      const { count: bizCount } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("Status", "approved");
      setBusinessCount(bizCount ?? 0);

      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("hero_image_url")
        .eq("id", 1)
        .single();
      setHeroUrl(settingsData?.hero_image_url || null);

      const { data: siteImagesData } = await supabase
        .from("site_images")
        .select("key, url")
        .in("key", [
          "homepage_hero",
          "business_zone_bg",
          "community_zone_bg",
          "emergency_zone_bg",
          "homepage_logo",
        ]);

      const imgMap = {};
      (siteImagesData || []).forEach((row) => {
        imgMap[row.key] = row.url;
      });

      // The admin "Homepage Hero Background" slot wins; old site_settings image is the fallback
      if (imgMap.homepage_hero) setHeroUrl(imgMap.homepage_hero);
      setBusinessBgUrl(imgMap.business_zone_bg || null);
      setCommunityBgUrl(imgMap.community_zone_bg || null);
      setEmergencyBgUrl(imgMap.emergency_zone_bg || null);
      setLogoUrl(imgMap.homepage_logo || null);
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-carbon text-white">
      <header className="relative border-b border-neutral-800 px-6 pt-8 pb-12 text-center overflow-hidden min-h-[560px] flex flex-col justify-center">
        {heroUrl && (
          <>
            <SafeImage
              src={heroUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
          </>
        )}

        <div className="relative z-10">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-500 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-neutral-200 hover:border-orange-500 hover:text-orange-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>

          <div className="flex justify-center mb-5">
            <Image
              src={logoUrl || "/logo.png"}
              alt="Ons Brandfort Bulletin"
              width={140}
              height={140}
              priority
            />
          </div>

          <h1 className="text-[3.25rem] leading-[0.92] sm:text-7xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Ons Brandfort
            <br />
            <span className="text-orange-500">Bulletin</span>
          </h1>
          <p className="text-neutral-100 mt-4 text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {t.tagline}
          </p>
          <p className="text-neutral-300 mt-3 text-sm max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {lang === "af"
              ? "'n Gratis platform waar elke plaaslike besigheid en gemeenskapsgeleentheid op een plek is."
              : "A free platform where every local business and community event lives in one place."}
          </p>

          <div className="mt-8 flex justify-center">
            <InstallButton lang={lang} />
          </div>

          <div className="mt-10 flex justify-center gap-10 sm:gap-16">
            <div>
              <p className="text-4xl sm:text-5xl font-black text-orange-500 tabular-nums">
                {businessCount !== null ? businessCount : "–"}
              </p>
              <p className="text-xs text-neutral-300 mt-1">{t.statBusinesses}</p>
            </div>
            <div className="w-px bg-neutral-600" />
            <div>
              <p className="text-4xl sm:text-5xl font-black text-orange-500 tabular-nums">
                {eventCount !== null ? eventCount : "–"}
              </p>
              <p className="text-xs text-neutral-300 mt-1">{t.statEvents}</p>
            </div>
          </div>
        </div>
      </header>
      <LiveTicker lang={lang} />

      <WeatherWidget lang={lang} />

      <FeaturedCarousel lang={lang} />

      <section className="py-6 border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-3">
            {t.events}
          </h2>
          {events.length === 0 ? (
            <p className="text-neutral-500 text-sm">
              {lang === "af" ? "Nog geen gebeurtenisse nie." : "No events yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {events.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-lg px-3 py-2.5"
                >
                  <SafeImage
                    src={event.image_url}
                    alt={event.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    fallback={
                      <div className="w-10 h-10 rounded-md bg-neutral-800 flex-shrink-0" />
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{event.title}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {event.date} {event.time && `· ${event.time}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Business / Community / Emergency — full-width photo zones */}
      <section className="py-8">
        <Link
          href="/business"
          className="relative block overflow-hidden border-y border-orange-500/40 min-h-[280px] flex flex-col justify-end hover:brightness-110 transition"
        >
          <ZoneBackground
            url={businessBgUrl}
            fallbackStyle={BUSINESS_FALLBACK}
            overlayClass="bg-gradient-to-t from-orange-950/95 via-orange-950/50 to-orange-950/20"
          />
          <div className="relative z-10 px-6 pb-6 pt-16">
            <h3 className="text-white font-black uppercase tracking-wide text-2xl mb-1 flex items-center gap-2">
              🏗️ {t.businessZone}
            </h3>
            <p className="text-sm text-neutral-200 mb-4">{t.businessNote}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {businessLinks.map((item) => (
                <div
                  key={item.href}
                  className="flex-shrink-0 flex flex-col items-center text-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-2.5 w-20"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    {item.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Link>

        <Link
          href="/community"
          className="relative block overflow-hidden border-y border-green-500/40 min-h-[280px] flex flex-col justify-end hover:brightness-110 transition mt-3"
        >
          <ZoneBackground
            url={communityBgUrl}
            fallbackStyle={COMMUNITY_FALLBACK}
            overlayClass="bg-gradient-to-t from-green-950/95 via-green-950/50 to-green-950/20"
          />
          <div className="relative z-10 px-6 pb-6 pt-16">
            <h3 className="text-white font-black uppercase tracking-wide text-2xl mb-1 flex items-center gap-2">
              🌱 {t.communityZone}
            </h3>
            <p className="text-sm text-neutral-200 mb-4">{t.communityNote}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {communityLinks.map((item) => (
                <div
                  key={item.href}
                  className="flex-shrink-0 flex flex-col items-center text-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-2.5 w-20"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    {item.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Link>

        <Link
          href="/emergency"
          className="relative block overflow-hidden border-y border-red-500/60 min-h-[280px] flex flex-col justify-center hover:brightness-110 transition mt-3"
        >
          <ZoneBackground
            url={emergencyBgUrl}
            fallbackStyle={EMERGENCY_FALLBACK}
            overlayClass="bg-black/25"
          />
          <div className="relative z-10 px-6 py-12 text-center">
            <h3
              className="text-white font-black uppercase tracking-wide text-2xl mb-1 flex items-center justify-center gap-2"
              style={{ textShadow: "0 0 18px rgba(239,68,68,0.8)" }}
            >
              🚨 {t.emergency}
            </h3>
            <p className="text-sm text-neutral-200 mb-4">{t.emergencyNote}</p>
            <div className="flex gap-2 justify-center overflow-x-auto pb-1">
              {emergencyLinks.map((item) => (
                <div
                  key={item.icon}
                  className="flex-shrink-0 flex flex-col items-center text-center gap-1 bg-black/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-2.5 w-20"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    {item.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </section>

      <SiteReviews lang={lang} />

      <Footer lang={lang} />
    </main>
  );
}