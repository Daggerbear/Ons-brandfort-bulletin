// src/app/business-updates/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

const CATEGORY_LABELS = {
  Special: { af: "Spesiaal", en: "Special" },
  "New Stock": { af: "Nuwe Voorraad", en: "New Stock" },
  Menu: { af: "Spyskaart", en: "Menu" },
  Offer: { af: "Aanbod", en: "Offer" },
  Announcement: { af: "Aankondiging", en: "Announcement" },
};

const CATEGORY_STYLES = {
  Special: { icon: "🔥", text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40" },
  "New Stock": { icon: "📦", text: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/40" },
  Menu: { icon: "🍽️", text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" },
  Offer: { icon: "🏷️", text: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/40" },
  Announcement: { icon: "📣", text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40" },
};

const DEFAULT_STYLE = {
  icon: "📢",
  text: "text-amber-400",
  bg: "bg-amber-500/15",
  border: "border-amber-500/40",
};

const MAX_PINNED = 7;

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

export default function BusinessUpdates() {
  const [lang, setLang] = useState("af");
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadUpdates = async () => {
      const [pinnedResult, restResult] = await Promise.all([
        supabase
          .from("business_updates")
          .select("*, businesses(id, name, logo_url, category)")
          .eq("Status", "approved")
          .eq("is_pinned", true)
          .order("pinned_at", { ascending: false })
          .limit(MAX_PINNED),
        supabase
          .from("business_updates")
          .select("*, businesses(id, name, logo_url, category)")
          .eq("Status", "approved")
          .eq("is_pinned", false)
          .order("created_at", { ascending: false }),
      ]);

      setUpdates([...(pinnedResult.data || []), ...(restResult.data || [])]);
      setLoading(false);
    };
    loadUpdates();
  }, []);

  const text = {
    af: {
      heading: "Besigheidsopdaterings",
      sub: "Spesiale aanbiedinge, nuwe voorraad en nuus van plaaslike besighede.",
      empty: "Nog geen opdaterings nie. Kom kyk gou weer!",
      emptyFilter: "Geen opdaterings in hierdie kategorie nie.",
      viewBusiness: "Besoek Besigheid",
      featured: "Uitgelig",
      latest: "Nuutste",
      all: "Alles",
      share: "Deel",
      composer: "Het jy nuus, 'n spesiaal of nuwe voorraad? Plaas dit hier.",
      composerCta: "Plaas",
    },
    en: {
      heading: "Business Updates",
      sub: "Specials, new stock, and news from local businesses.",
      empty: "No updates yet. Check back soon!",
      emptyFilter: "No updates in this category.",
      viewBusiness: "View Business",
      featured: "Featured",
      latest: "Latest",
      all: "All",
      share: "Share",
      composer: "Got news, a special or new stock? Post it here.",
      composerCta: "Post",
    },
  };

  const t = text[lang];

  const filtered =
    filter === "all" ? updates : updates.filter((u) => u.category === filter);
  const pinned = filtered.filter((u) => u.is_pinned);
  const rest = filtered.filter((u) => !u.is_pinned);

  function handleShare(u) {
    const name = u.businesses?.name ? `${u.businesses.name}: ` : "";
    const msg = `${name}${u.title}\n\n${window.location.origin}/business-updates`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function renderCard(u) {
    const catLabel = CATEGORY_LABELS[u.category]?.[lang] || u.category;
    const style = CATEGORY_STYLES[u.category] || DEFAULT_STYLE;
    const biz = u.businesses;

    return (
      <article
        key={u.id}
        className={`rounded-2xl overflow-hidden border ${
          u.is_pinned
            ? "border-yellow-500/70 bg-gradient-to-b from-yellow-500/10 to-neutral-900 shadow-lg shadow-yellow-500/10"
            : "border-neutral-800 bg-neutral-900"
        }`}
      >
        {u.is_pinned && (
          <div className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold uppercase tracking-wide px-3 py-1">
            👑 {t.featured}
          </div>
        )}

        {/* Business header */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <SafeImage
            src={biz?.logo_url}
            alt={biz?.name || ""}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
            fallback={
              <div className="w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
            }
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{biz?.name}</p>
            <p className="text-xs text-neutral-500">{timeAgo(u.created_at, lang)}</p>
          </div>
          <span
            className={`text-xs font-semibold rounded-full px-2.5 py-1 border flex-shrink-0 ${style.text} ${style.bg} ${style.border}`}
          >
            {style.icon} {catLabel}
          </span>
        </div>

        {/* Text */}
        <div className="px-4 pb-3">
          <h2 className="text-lg font-bold mb-1">{u.title}</h2>
          <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line break-words">
            {u.body}
          </p>
        </div>

        {/* Media */}
        {u.image_url && (
          <div className="relative w-full h-64 bg-neutral-950">
            <SafeImage
              src={u.image_url}
              alt={u.title}
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-contain"
            />
          </div>
        )}
        {u.youtube_id && (
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${u.youtube_id}`}
              title={u.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 p-3 border-t border-neutral-800">
          {biz?.id && (
            <Link
              href={`/business/${biz.id}`}
              className="flex-1 text-center text-sm font-semibold text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition rounded-lg py-2"
            >
              {t.viewBusiness} →
            </Link>
          )}
          <button
            onClick={() => handleShare(u)}
            className="flex-1 text-center text-sm text-neutral-300 border border-neutral-700 hover:border-amber-400 hover:text-amber-400 transition rounded-lg py-2"
          >
            📲 {t.share}
          </button>
        </div>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col relative">
      <Nav lang={lang} />

      {/* Header */}
      <header
        className="border-b border-amber-900/60 px-4 pt-6 pb-5"
        style={{
          background: "radial-gradient(circle at 80% 0%, #78350f, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              📢 <span className="text-amber-400">{t.heading}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{t.sub}</p>
          </div>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-amber-400 hover:text-amber-400 transition flex-shrink-0"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 flex-1 w-full">
        {/* Post prompt */}
        <Link
          href="/business-updates/submit"
          className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-amber-500 transition rounded-2xl p-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center text-lg flex-shrink-0">
            🏪
          </div>
          <span className="text-neutral-400 text-sm flex-1 min-w-0">{t.composer}</span>
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-500 text-black rounded-full px-3 py-1.5 flex-shrink-0">
            {t.composerCta}
          </span>
        </Link>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
              filter === "all"
                ? "bg-amber-500 border-amber-500 text-black font-semibold"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {t.all}
          </button>
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                filter === cat
                  ? "bg-amber-500 border-amber-500 text-black font-semibold"
                  : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
              }`}
            >
              {CATEGORY_STYLES[cat].icon} {CATEGORY_LABELS[cat][lang]}
            </button>
          ))}
        </div>

        {loading && <SkeletonList Component={SkeletonPostCard} count={4} />}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-3">📢</div>
            <p className="text-neutral-500 text-sm">
              {updates.length === 0 ? t.empty : t.emptyFilter}
            </p>
          </div>
        )}

        {/* Featured */}
        {pinned.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-yellow-400 mb-3">
              👑 {t.featured}
            </h2>
            <div className="space-y-4">{pinned.map(renderCard)}</div>
          </section>
        )}

        {/* Latest */}
        {rest.length > 0 && (
          <section>
            {pinned.length > 0 && (
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-3">
                {t.latest}
              </h2>
            )}
            <div className="space-y-4">{rest.map(renderCard)}</div>
          </section>
        )}
      </div>

      {/* Floating + button */}
      <Link
        href="/business-updates/submit"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 transition text-black text-3xl font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 z-50"
        aria-label="Post an update"
      >
        +
      </Link>

      <Footer lang={lang} />
    </main>
  );
}