// src/app/community/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import SafeImage from "@/components/SafeImage";

const text = {
  af: {
    title: "Gemeenskap",
    tagline: "Waar Brandfort saam lewe, deel en groei.",
    statEvents: "Gebeurtenisse",
    feed: {
      title: "Gemeenskap Feed",
      desc: "Vrae, nuus, shoutouts en video's van jou bure.",
      cta: "Maak Oop",
    },
    buySell: { title: "Koop & Verkoop", desc: "Plaaslike classifieds." },
    glitch: { title: "Glitch Cafe", desc: "Speletjies vir 'n bietjie plesier." },
    events: "🔥 Wat Gebeur",
    noEvents: "Nog geen gebeurtenisse nie.",
    listEvent: "Lys Jou Gebeurtenis",
    listEventDesc: "Deel jou gebeurtenis met die dorp.",
  },
  en: {
    title: "Community",
    tagline: "Where Brandfort lives, shares, and grows together.",
    statEvents: "Events",
    feed: {
      title: "Community Feed",
      desc: "Questions, news, shoutouts and videos from your neighbours.",
      cta: "Open",
    },
    buySell: { title: "Buy & Sell", desc: "Local classifieds." },
    glitch: { title: "Glitch Cafe", desc: "Games for a bit of fun." },
    events: "🔥 What's Happening",
    noEvents: "No events yet.",
    listEvent: "List Your Event",
    listEventDesc: "Share your event with the town.",
  },
};

export default function CommunityHub() {
  const [lang, setLang] = useState("af");
  const [bgUrl, setBgUrl] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventCount, setEventCount] = useState(null);

  const t = text[lang];

  useEffect(() => {
    const load = async () => {
      const [bgRes, evRes] = await Promise.all([
        supabase
          .from("site_images")
          .select("url")
          .eq("key", "community_zone_bg")
          .maybeSingle(),
        supabase
          .from("events")
          .select("*", { count: "exact" })
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setBgUrl(bgRes.data?.url || null);
      setEvents(evRes.data || []);
      setEventCount(evRes.count ?? evRes.data?.length ?? 0);
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      {/* Hero */}
      <header
        className="relative overflow-hidden border-b border-green-900/60 px-6 pt-8 pb-10 text-center"
        style={{
          background: "radial-gradient(circle at 30% 20%, #14532d, #052e16 70%)",
        }}
      >
        {bgUrl && (
          <SafeImage
            src={bgUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(rgba(5,46,22,0.75), rgba(10,10,10,0.95))",
          }}
        />

        <div className="relative z-10">
          <div className="flex justify-end mb-6 max-w-2xl mx-auto">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-green-400 hover:text-green-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>

          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="text-green-400">{t.title}</span>
          </h1>
          <p className="text-neutral-300 mt-3 text-base max-w-md mx-auto">
            {t.tagline}
          </p>

          <div className="mt-6 inline-flex flex-col items-center">
            <p className="text-3xl font-black text-green-400 tabular-nums">
              {eventCount !== null ? eventCount : "–"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{t.statEvents}</p>
          </div>
        </div>
      </header>

      {/* Events */}
      <section className="pt-8 pb-5">
        <h2 className="text-3xl font-black tracking-tight px-6 max-w-2xl mx-auto mb-5">
          {t.events}
        </h2>

        {events.length === 0 ? (
          <p className="px-6 max-w-2xl mx-auto text-neutral-500 text-sm">
            {t.noEvents}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden snap-start border border-neutral-800 hover:border-green-400 transition bg-neutral-900"
              >
                <SafeImage
                  src={event.image_url}
                  alt={event.title}
                  fill
                  sizes="256px"
                  className="object-cover"
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-green-950 to-neutral-900">
                      📅
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {event.date && (
                  <div className="absolute top-3 left-3 bg-green-400 text-black text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    {event.date}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-black text-white leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-neutral-300 mt-1">
                    {event.time} {event.location && `· ${event.location}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* List Your Event — its own separate button */}
      <section className="px-6 pb-8 max-w-2xl mx-auto">
        <Link
          href="/list-your-event"
          className="flex items-center justify-center gap-3 border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition font-bold rounded-2xl px-5 py-4"
        >
          <span className="text-2xl">📅</span>
          <span>{t.listEvent}</span>
        </Link>
        <p className="text-center text-xs text-neutral-500 mt-2">
          {t.listEventDesc}
        </p>
      </section>

      {/* Buttons */}
      <section className="px-6 pb-10 max-w-2xl mx-auto">
        <Link
          href="/feed"
          className="block rounded-2xl p-6 mb-4 border-2 transition hover:scale-[1.01]"
          style={{
            borderColor: "#4ade80",
            background:
              "linear-gradient(135deg, rgba(74,222,128,0.18), rgba(16,185,129,0.1)), #0a0a0a",
            boxShadow: "0 0 24px rgba(74,222,128,0.25)",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">💬</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black uppercase tracking-wide text-green-400">
                {t.feed.title}
              </h2>
              <p className="text-sm text-neutral-300 mt-1">{t.feed.desc}</p>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-green-400 text-black flex-shrink-0">
              {t.feed.cta}
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/classifieds"
            className="bg-neutral-900 border border-green-500/30 hover:border-green-400 transition rounded-xl p-4 flex flex-col items-center text-center gap-1"
          >
            <span className="text-3xl">🛒</span>
            <h2 className="text-sm font-semibold text-green-400">{t.buySell.title}</h2>
            <p className="text-xs text-neutral-500">{t.buySell.desc}</p>
          </Link>

          <Link
            href="/games"
            className="rounded-xl p-4 flex flex-col items-center text-center gap-1 border-2 transition hover:scale-[1.01]"
            style={{
              borderColor: "#a855f7",
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.15), rgba(236,72,153,0.15)), #0a0a0a",
            }}
          >
            <span className="text-3xl">🕹️</span>
            <h2
              className="text-sm font-black uppercase tracking-wide"
              style={{
                background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.glitch.title}
            </h2>
            <p className="text-xs text-neutral-500">{t.glitch.desc}</p>
          </Link>
        </div>
      </section>
    </main>
  );
}