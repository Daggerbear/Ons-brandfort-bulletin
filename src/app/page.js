"use client";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import InstallButton from "@/components/InstallButton";

export default function Home() {
  const [lang, setLang] = useState("af");
  const [events, setEvents] = useState([]);
  const [heroUrl, setHeroUrl] = useState(null);
  const [siteReviews, setSiteReviews] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [businessCount, setBusinessCount] = useState(null);
  const [eventCount, setEventCount] = useState(null);

  const text = {
    af: {
      tagline: "Die hart van Brandfort, op een plek.",
      events: "🔥 Wat Gebeur",
      footer: "Gebou deur Jaco du Plessis — vir Brandfort, deur Brandfort.",
      siteReviewsTitle: "Wat Sê Brandfort",
      noSiteReviews: "Nog geen resensies nie. Wees die eerste!",
      yourName: "Jou naam (opsioneel)",
      yourComment: "Skryf 'n resensie...",
      submit: "Plaas Resensie",
      submitting: "Stuur...",
      statBusinesses: "Besighede Gelys",
      statEvents: "Gebeurtenisse",
      cards: [
        { icon: "🏪", title: "Ons Besighede", desc: "Blaai deur plaaslike besighede.", href: "/besighede" },
        { icon: "💬", title: "Gemeenskap Feed", desc: "Vrae, nuus, shoutouts.", href: "/feed" },
        { icon: "🛒", title: "Koop & Verkoop", desc: "Plaaslike classifieds.", href: "/classifieds" },
        { icon: "💼", title: "Werk", desc: "Vind werk of adverteer.", href: "/jobs" },
        { icon: "🚨", title: "Nood Kontakte", desc: "Belangrike nommers.", href: "/emergency" },
      ],
      glitchCafe: {
        title: "Glitch Cafe",
        desc: "Speletjies vir 'n bietjie plesier — Battleship, Sudoku, Riddle Rush en meer.",
        cta: "Speel Nou",
      },
    },
    en: {
      tagline: "The heart of Brandfort, in one place.",
      events: "🔥 What's Happening",
      footer: "Built by Jaco du Plessis — for Brandfort, by Brandfort.",
      siteReviewsTitle: "What Brandfort Says",
      noSiteReviews: "No reviews yet. Be the first!",
      yourName: "Your name (optional)",
      yourComment: "Write a review...",
      submit: "Post Review",
      submitting: "Posting...",
      statBusinesses: "Businesses Listed",
      statEvents: "Events",
      cards: [
        { icon: "🏪", title: "Our Businesses", desc: "Browse local businesses by category.", href: "/besighede" },
        { icon: "💬", title: "Community Feed", desc: "Questions, news, shoutouts.", href: "/feed" },
        { icon: "🛒", title: "Buy & Sell", desc: "Local classifieds.", href: "/classifieds" },
        { icon: "💼", title: "Jobs", desc: "Find work or advertise.", href: "/jobs" },
        { icon: "🚨", title: "Emergency Contacts", desc: "Important numbers.", href: "/emergency" },
      ],
      glitchCafe: {
        title: "Glitch Cafe",
        desc: "Local games for a bit of fun — Battleship, Sudoku, Riddle Rush and more.",
        cta: "Play Now",
      },
    },
  };

  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
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

      fetchSiteReviews();
    };
    loadData();
  }, []);

  const fetchSiteReviews = async () => {
    const { data } = await supabase
      .from("site_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setSiteReviews(data || []);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) return;
    setSubmittingReview(true);

    const { error } = await supabase.from("site_reviews").insert({
      name: reviewName.trim() || null,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });

    setSubmittingReview(false);

    if (!error) {
      setReviewName("");
      setReviewRating(0);
      setReviewComment("");
      fetchSiteReviews();
    }
  };

  const averageSiteRating =
    siteReviews.length > 0
      ? (siteReviews.reduce((sum, r) => sum + r.rating, 0) / siteReviews.length).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-carbon text-white">
      <Nav lang={lang} />

      <header
        className="relative border-b border-neutral-800 px-6 pt-8 pb-10 text-center overflow-hidden"
        style={
          heroUrl
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${heroUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="Ons Brandfort Bulletin" width={120} height={120} priority />
        </div>

        <h1 className="text-[2.75rem] leading-[0.95] sm:text-6xl font-black tracking-tight">
          Ons Brandfort
          <br />
          <span className="text-orange-500">Bulletin</span>
        </h1>
        <p className="text-neutral-400 mt-4 text-lg">{t.tagline}</p>
        <p className="text-neutral-500 mt-3 text-sm max-w-md mx-auto">
          {lang === "af"
            ? "'n Gratis platform waar elke plaaslike besigheid en gemeenskapsgeleentheid op een plek is."
            : "A free platform where every local business and community event lives in one place."}
        </p>

        <div className="mt-7 flex justify-center">
          <InstallButton lang={lang} />
        </div>

        <div className="mt-9 flex justify-center gap-10 sm:gap-16">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-orange-500 tabular-nums">
              {businessCount !== null ? businessCount : "–"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">{t.statBusinesses}</p>
          </div>
          <div className="w-px bg-neutral-800" />
          <div>
            <p className="text-3xl sm:text-4xl font-black text-orange-500 tabular-nums">
              {eventCount !== null ? eventCount : "–"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">{t.statEvents}</p>
          </div>
        </div>
      </header>

      {/* Events Section */}
      <section className="py-10">
        <h2 className="text-3xl font-black tracking-tight px-6 max-w-2xl mx-auto mb-5">
          {t.events}
        </h2>
        {events.length === 0 ? (
          <p className="px-6 max-w-2xl mx-auto text-neutral-500 text-sm">
            {lang === "af" ? "Nog geen gebeurtenisse nie." : "No events yet."}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden snap-start border border-neutral-800 hover:border-orange-500 transition"
              >
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {event.date && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-black text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
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

      <FeaturedCarousel lang={lang} />

      {/* Quick-link cards */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <Link
          href="/games"
          className="block relative rounded-2xl p-5 mb-4 overflow-hidden border-2 transition hover:scale-[1.01]"
          style={{
            borderColor: "#a855f7",
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.15), rgba(236,72,153,0.15)), #0a0a0a",
            boxShadow: "0 0 24px rgba(168,85,247,0.35)",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🕹️</span>
            <div className="flex-1 min-w-0">
              <h2
                className="text-xl font-black uppercase tracking-wide"
                style={{
                  background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.glitchCafe.title}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">{t.glitchCafe.desc}</p>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-purple-500 text-black flex-shrink-0">
              {t.glitchCafe.cta}
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {t.cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-4 flex flex-col items-center text-center gap-1"
            >
              <span className="text-3xl">{c.icon}</span>
              <h2 className="text-sm font-semibold text-orange-400">{c.title}</h2>
              <p className="text-xs text-neutral-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action Buttons */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/list-your-business"
            className="flex flex-col items-center text-center gap-2 bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-2xl px-4 py-6"
          >
            <span className="text-3xl">🏪</span>
            <span>{lang === "af" ? "Lys Jou Besigheid" : "List Your Business"}</span>
          </a>
          <a
            href="/list-your-event"
            className="flex flex-col items-center text-center gap-2 border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition font-semibold rounded-2xl px-4 py-6"
          >
            <span className="text-3xl">📅</span>
            <span>{lang === "af" ? "Lys Jou Gebeurtenis" : "List Your Event"}</span>
          </a>
        </div>
      </section>

      {/* Site Reviews */}
      <section className="px-6 py-10 max-w-2xl mx-auto border-t border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black tracking-tight">{t.siteReviewsTitle}</h2>
          {averageSiteRating && (
            <div className="text-right">
              <p className="text-2xl font-black text-orange-500 leading-none">
                {averageSiteRating}
              </p>
              <p className="text-yellow-400 text-sm mt-0.5">
                {"★".repeat(Math.round(averageSiteRating))}
                {"☆".repeat(5 - Math.round(averageSiteRating))}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setReviewRating(star)}
                className={`text-3xl transition ${
                  star <= reviewRating ? "text-yellow-400" : "text-neutral-700"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={t.yourName}
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white"
          />
          <textarea
            placeholder={t.yourComment}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={2}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white"
          />
          <button
            onClick={handleReviewSubmit}
            disabled={reviewRating === 0 || submittingReview}
            className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-50"
          >
            {submittingReview ? t.submitting : t.submit}
          </button>
        </div>

        {siteReviews.length === 0 && (
          <p className="text-neutral-500 text-sm">{t.noSiteReviews}</p>
        )}

        <div className="grid gap-3">
          {siteReviews.map((r) => (
            <div
              key={r.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-yellow-400 text-sm">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
                {r.name && (
                  <span className="text-sm font-semibold text-neutral-300">{r.name}</span>
                )}
              </div>
              {r.comment && (
                <p className="text-neutral-400 text-sm leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer lang={lang} />
    </main>
  );
}