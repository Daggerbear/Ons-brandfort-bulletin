// src/app/business/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { CATEGORIES } from "@/lib/categories";
import { timeAgo } from "@/lib/feedUi";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import SafeImage from "@/components/SafeImage";
import { ListingCard } from "@/components/FeedCards";
import { SkeletonPostCard } from "@/components/Skeleton";

const PAGE_SIZE = 15;

const UPDATE_LABELS = {
  Special: { af: "Spesiaal", en: "Special" },
  "New Stock": { af: "Nuwe Voorraad", en: "New Stock" },
  Menu: { af: "Spyskaart", en: "Menu" },
  Offer: { af: "Aanbod", en: "Offer" },
  Announcement: { af: "Aankondiging", en: "Announcement" },
};

const UPDATE_STYLES = {
  Special: { icon: "🔥", text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40" },
  "New Stock": { icon: "📦", text: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/40" },
  Menu: { icon: "🍽️", text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" },
  Offer: { icon: "🏷️", text: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/40" },
  Announcement: { icon: "📣", text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40" },
};

const text = {
  af: {
    seo: "Besighede in Brandfort — Ons Brandfort Bulletin",
    search: "Soek 'n diens (loodgieter, kapper, dokter...)",
    all: "Alles",
    updates: "Opdaterings",
    businesses: "Nuwe besighede",
    jobs: "Vakatures",
    browse: "Alle besighede",
    newTag: "Nuut op die Bulletin",
    hiring: "Vakature",
    empty: "Nog niks hier nie.",
    more: "Wys meer",
    ctaTitle: "Is jy 'n plaaslike besigheid?",
    ctaDesc: "Lys jou besigheid gratis en bereik die hele dorp.",
    ctaButton: "Lys my besigheid",
  },
  en: {
    seo: "Businesses in Brandfort — Ons Brandfort Bulletin",
    search: "Find a service (plumber, hairdresser, doctor...)",
    all: "All",
    updates: "Updates",
    businesses: "New businesses",
    jobs: "Jobs",
    browse: "All businesses",
    newTag: "New on the Bulletin",
    hiring: "Hiring",
    empty: "Nothing here yet.",
    more: "Show more",
    ctaTitle: "Own a local business?",
    ctaDesc: "List your business for free and reach the whole town.",
    ctaButton: "List my business",
  },
};

const CHIPS = [
  { key: "all", label: "all" },
  { key: "update", label: "updates" },
  { key: "business", label: "businesses" },
  { key: "job", label: "jobs" },
];

function Logo({ url, name, size = 40 }) {
  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-sm font-bold text-orange-400">
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-full bg-neutral-800"
      style={{ width: size, height: size }}
    >
      {url ? (
        <SafeImage
          src={url}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          fallback={fallback}
        />
      ) : (
        fallback
      )}
    </div>
  );
}

function UpdateCard({ u, lang }) {
  const b = u.businesses;
  const label = UPDATE_LABELS[u.category];
  const style = UPDATE_STYLES[u.category];
  return (
    <Link
      href={b?.id ? `/business/${b.id}` : "/besighede"}
      className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-amber-400"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
        {u.image_url ? (
          <SafeImage
            src={u.image_url}
            alt={u.title || ""}
            fill
            sizes="64px"
            className="object-cover"
            fallback={<Logo url={b?.logo_url} name={b?.name} size={64} />}
          />
        ) : (
          <Logo url={b?.logo_url} name={b?.name} size={64} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold text-neutral-300">
            {u.is_pinned && "📌 "}
            {b?.name}
          </p>
          <span className="flex-shrink-0 text-[11px] text-neutral-500">
            {timeAgo(u.created_at, lang)}
          </span>
        </div>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-bold leading-snug">{u.title}</h3>
        {u.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">{u.body}</p>
        )}
        {label && style && (
          <span
            className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.text} ${style.bg} ${style.border}`}
          >
            {style.icon} {label[lang]}
          </span>
        )}
      </div>
    </Link>
  );
}

function NewBusinessCard({ b, lang, tag }) {
  const cat = CATEGORIES.find((c) => c.name === b.category);
  return (
    <Link
      href={`/business/${b.id}`}
      className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-orange-500"
    >
      <Logo url={b.logo_url} name={b.name} size={56} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-400">
          ✨ {tag}
        </p>
        <p className="truncate font-semibold">{b.name}</p>
        <p className="truncate text-xs text-neutral-400">
          {cat ? `${cat.icon} ${cat[lang]}` : b.category}
        </p>
        {b.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">{b.description}</p>
        )}
      </div>
    </Link>
  );
}

export default function BusinessFeed() {
  const { lang } = useLang();
  const t = text[lang];

  const [data, setData] = useState({ updates: [], businesses: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f && CHIPS.some((c) => c.key === f)) setFilter(f);
  }, []);

  useEffect(() => {
    let active = true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // vacancies drop off after 30 days
    (async () => {
      const [u, b, j] = await Promise.all([
        supabase
          .from("business_updates")
          .select("*, businesses(id, name, logo_url, category)")
          .eq("Status", "approved")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("businesses")
          .select("id, name, logo_url, category, description, created_at")
          .eq("Status", "approved")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("jobs")
          .select("id, title, category, type, created_at")
          .eq("is_hidden", false)
          .eq("is_filled", false)
          .eq("type", "job")
          .gte("created_at", cutoff.toISOString())
          .order("created_at", { ascending: false })
          .limit(15),
      ]);
      if (!active) return;
      const rows = (r) => (r.error ? [] : r.data || []);
      setData({ updates: rows(u), businesses: rows(b), jobs: rows(j) });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Pinned updates first, then everything newest first
  const stream = useMemo(() => {
    const all = [
      ...data.updates.map((x) => ({ kind: "update", key: `up-${x.id}`, at: x.created_at, pinned: !!x.is_pinned, row: x })),
      ...data.businesses.map((x) => ({ kind: "business", key: `bz-${x.id}`, at: x.created_at, pinned: false, row: x })),
      ...data.jobs.map((x) => ({ kind: "job", key: `jb-${x.id}`, at: x.created_at, pinned: false, row: x })),
    ];
    const filtered = filter === "all" ? all : all.filter((x) => x.kind === filter);
    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.at) - new Date(a.at);
    });
  }, [data, filter]);

  const shown = stream.slice(0, visible);
  const categories = CATEGORIES.filter((c) => c.slug !== "all");

  function renderItem(item) {
    const r = item.row;
    if (item.kind === "update") return <UpdateCard key={item.key} u={r} lang={lang} />;
    if (item.kind === "business") {
      return <NewBusinessCard key={item.key} b={r} lang={lang} tag={t.newTag} />;
    }
    const cat = r.category;
    return (
      <ListingCard
        key={item.key}
        href="/jobs"
        icon="💼"
        tag={t.hiring}
        tagClass="text-emerald-400"
        title={r.title}
        meta={cat}
        ago={timeAgo(r.created_at, lang)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-carbon text-white">
      <h1 className="sr-only">{t.seo}</h1>

      <div className="mx-auto max-w-2xl px-4 pt-4">
        <Link
          href="/vind"
          className="flex items-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3.5 text-neutral-400 transition hover:border-orange-500"
        >
          <span className="text-xl">🔎</span>
          <span className="truncate text-sm">{t.search}</span>
        </Link>

        <div className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            href="/besighede"
            className="flex-shrink-0 rounded-full border border-orange-500/60 bg-orange-500/10 px-3.5 py-1.5 text-sm font-medium text-orange-300"
          >
            {t.browse}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/besighede/${c.slug}`}
              className="flex-shrink-0 rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm text-neutral-300 transition hover:border-orange-500"
            >
              {c.icon} {c[lang]}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <FeaturedCarousel lang={lang} />
      </div>

      {/* Filter chips stay under the top bar while you scroll */}
      <div className="sticky top-14 z-30 mt-4 border-y border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="scrollbar-hide mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2.5">
          {CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => {
                setFilter(chip.key);
                setVisible(PAGE_SIZE);
              }}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                filter === chip.key
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-neutral-700 text-neutral-300 hover:border-orange-500"
              }`}
            >
              {t[chip.label]}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        {loading ? (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">{t.empty}</p>
        ) : (
          shown.map(renderItem)
        )}

        {!loading && stream.length > visible && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full rounded-full border border-neutral-700 py-3 text-sm font-medium text-neutral-200 transition hover:border-orange-500 hover:text-orange-400"
          >
            {t.more}
          </button>
        )}

        <div className="mt-6 rounded-2xl border border-orange-500/30 bg-neutral-900 p-5 text-center">
          <p className="text-lg font-black">{t.ctaTitle}</p>
          <p className="mb-4 mt-1 text-sm text-neutral-400">{t.ctaDesc}</p>
          <Link
            href="/create/business"
            className="inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-600"
          >
            🏪 {t.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}