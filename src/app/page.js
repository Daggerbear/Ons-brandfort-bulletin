// src/app/page.js
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import { timeAgo } from "@/lib/feedUi";
import { trackEvent } from "@/lib/analytics";
import LiveTicker from "@/components/LiveTicker";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import InstallButton from "@/components/InstallButton";
import PostCard from "@/components/PostCard";
import { ListingCard, AdCard, EventTile } from "@/components/FeedCards";
import { SkeletonPostCard } from "@/components/Skeleton";
import { MissionCard, HunterPromoCard } from "@/components/HunterCards";
import { HUNTERS_ENABLED } from "@/lib/features";

const PAGE_SIZE = 20;
const AD_EVERY = 10; // a sponsored card after every 10th main post
const LISTING_EVERY = 5; // so every 6th card is a Buy & Sell listing
const MISSION_EVERY = 7; // a mission card after every 7th main post (Hunters only)
const PROMO_AT = 3; // the "Become a Hunter" card appears after the 3rd post
const SHOW_HOUSING_IN_ALL = false; // housing still has its own chip

function isSeeker(job) {
  return String(job.type || "").toLowerCase().includes("seek");
}

const text = {
  af: {
    seo: "Ons Brandfort Bulletin — Brandfort se gemeenskapsplatform",
    welcomeTitle: "Welkom by Ons Brandfort Bulletin 👋",
    welcomeBody:
      "Die hart van Brandfort, op een plek: nuus, besighede, werk, koop & verkoop en speletjies. Maak 'n gratis rekening om te plaas, vlakke te verdien en jou eie profiel te kry.",
    signIn: "Teken in met Google",
    wait: "Wag...",
    dismiss: "Maak toe",
    events: "🔥 Wat Gebeur",
    all: "Alles",
    post: "Feed",
    classified: "Koop & Verkoop",
    housing: "Behuising",
    job: "Soek werk",
    empty: "Nog niks hier nie. Wees die eerste om iets te plaas!",
    more: "Wys meer",
    forRent: "Te huur",
    forSale: "Te koop",
    hiring: "Vakature",
    seeking: "Soek werk",
    priceOnRequest: "Prys op navraag",
    bedrooms: (n) => `${n} slaapkamer${n === 1 ? "" : "s"}`,
    mission: "Missie",
    terms: "Bepalings",
    privacy: "Privaatheid",
    contact: "Kontak",
  },
  en: {
    seo: "Ons Brandfort Bulletin — Brandfort's community platform",
    welcomeTitle: "Welcome to Ons Brandfort Bulletin 👋",
    welcomeBody:
      "The heart of Brandfort, in one place: news, businesses, jobs, buy & sell and games. Create a free account to post, earn levels and get your own profile.",
    signIn: "Sign in with Google",
    wait: "Please wait...",
    dismiss: "Close",
    events: "🔥 What's Happening",
    all: "All",
    post: "Feed",
    classified: "Buy & Sell",
    housing: "Housing",
    job: "Looking for work",
    empty: "Nothing here yet. Be the first to post something!",
    more: "Show more",
    forRent: "For rent",
    forSale: "For sale",
    hiring: "Hiring",
    seeking: "Looking for work",
    priceOnRequest: "Price on request",
    bedrooms: (n) => `${n} bedroom${n === 1 ? "" : "s"}`,
    mission: "Mission",
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
  },
};

const CHIPS = ["all", "post", "classified", "housing", "job"];

function formatPrice(price, onRequest, t) {
  if (onRequest) return t.priceOnRequest;
  const n = Number(price);
  if (price === null || price === undefined || price === "" || !Number.isFinite(n)) return null;
  return `R ${n.toLocaleString("en-ZA")}`;
}

export default function CommunityHome() {
  const { lang } = useLang();
  const t = text[lang];
  const { user, loading: authLoading, busy, signInWithGoogle } = useAuth();

  const [data, setData] = useState({
    posts: [],
    classifieds: [],
    housing: [],
    jobs: [],
    events: [],
    ads: [],
  });
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [welcomeSeen, setWelcomeSeen] = useState(true);
  const [quests, setQuests] = useState([]);
  const [promoSeen, setPromoSeen] = useState(true);
  const [focus, setFocus] = useState(null); // { kind, id } from ?focus=
  const [pinned, setPinned] = useState(null);
  const rolls = useRef({}); // one random number per item so the shuffle holds still

  useEffect(() => {
    try {
      setWelcomeSeen(localStorage.getItem("bulletin_welcome") === "1");
      setPromoSeen(localStorage.getItem("bulletin_hunter_promo") === "1");
    } catch {
      setWelcomeSeen(false);
      setPromoSeen(false);
    }

    // Links like /?focus=post-12 or /?filter=classified come from the profile and the post pages
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    if (f && CHIPS.includes(f)) setFilter(f);
    const target = params.get("focus");
    if (target) {
      const dash = target.indexOf("-");
      const kind = target.slice(0, dash);
      const id = target.slice(dash + 1);
      if (["post", "classified", "housing", "job"].includes(kind) && id) {
        setFocus({ kind, id });
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    trackEvent("page_view");

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    (async () => {
      const [p, c, h, j, e, a] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("is_hidden", false)
          .gte("created_at", cutoff.toISOString())
          .order("created_at", { ascending: false })
          .limit(40),
        supabase
          .from("classifieds")
          .select("id, title, price, price_on_request, category, image_url, created_at")
          .eq("is_hidden", false)
          .eq("is_sold", false)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("housing")
          .select(
            "id, title, listing_type, property_type, area, bedrooms, price, price_on_request, image_url, created_at"
          )
          .eq("is_hidden", false)
          .eq("is_taken", false)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("jobs")
          .select("id, title, type, category, created_at")
          .eq("is_hidden", false)
          .eq("is_filled", false)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("events")
          .select("id, title, date, time, image_url")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("sponsored_ads").select("*").eq("active", true),
      ]);

      if (!active) return;
      const rows = (r) => (r.error ? [] : r.data || []);
      const posts = rows(p);
      setData({
        posts,
        classifieds: rows(c),
        housing: rows(h),
        jobs: rows(j),
        events: rows(e),
        ads: rows(a),
      });
      setLoading(false);

      if (posts.length > 0) {
        const { data: commentRows, error } = await supabase
          .from("comments")
          .select("*")
          .in("post_id", posts.map((x) => x.id))
          .order("created_at", { ascending: true });
        if (!active || error) return;
        const grouped = {};
        (commentRows || []).forEach((cm) => {
          if (!grouped[cm.post_id]) grouped[cm.post_id] = [];
          grouped[cm.post_id].push(cm);
        });
        setComments(grouped);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Hunters see their open daily missions inside the feed
  const userId = user?.id;
  const isHunter = HUNTERS_ENABLED && !!user?.user_metadata?.hunter;
  useEffect(() => {
    if (!userId || !isHunter) {
      setQuests([]);
      return;
    }
    let active = true;
    supabase.rpc("my_quests").then(({ data: rows, error }) => {
      if (!active || error) return;
      setQuests((rows || []).filter((q) => q.o_period === "daily" && !q.o_done));
    });
    return () => {
      active = false;
    };
  }, [userId, isHunter]);

  // A link that points at one post: show it at the top, even if it's older than the feed window
  useEffect(() => {
    if (!focus || loading) return;
    const tables = {
      post: ["posts", "*"],
      classified: ["classifieds", "id, title, price, price_on_request, category, image_url, created_at"],
      housing: ["housing", "id, title, listing_type, property_type, area, bedrooms, price, price_on_request, image_url, created_at"],
      job: ["jobs", "id, title, type, category, created_at"],
    };
    const [table, cols] = tables[focus.kind];
    let active = true;
    supabase
      .from(table)
      .select(cols)
      .eq("id", focus.id)
      .eq("is_hidden", false)
      .maybeSingle()
      .then(({ data: row }) => {
        if (active && row) setPinned({ kind: focus.kind, key: `${focus.kind}-${row.id}`, row });
      });
    return () => {
      active = false;
    };
  }, [focus, loading]);

  const addComment = (postId, comment) => {
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
  };

  const dismissPromo = () => {
    setPromoSeen(true);
    try {
      localStorage.setItem("bulletin_hunter_promo", "1");
    } catch {}
  };

  const dismissWelcome = () => {
    setWelcomeSeen(true);
    try {
      localStorage.setItem("bulletin_welcome", "1");
    } catch {}
  };

  // Random but fair: newer posts are still more likely to land near the top
  const roll = (key) => {
    if (rolls.current[key] === undefined) rolls.current[key] = Math.random();
    return rolls.current[key];
  };

  const { mainStream, listings } = useMemo(() => {
    const seekers = data.jobs.filter(isSeeker);
    const main = [
      ...data.posts.map((x) => ({ kind: "post", key: `post-${x.id}`, at: x.created_at, row: x })),
      ...seekers.map((x) => ({ kind: "job", key: `job-${x.id}`, at: x.created_at, row: x })),
      ...(SHOW_HOUSING_IN_ALL
        ? data.housing.map((x) => ({ kind: "housing", key: `housing-${x.id}`, at: x.created_at, row: x }))
        : []),
    ];
    const cls = data.classifieds.map((x) => ({
      kind: "classified",
      key: `classified-${x.id}`,
      at: x.created_at,
      row: x,
    }));

    const byNewest = (a, b) => new Date(b.at) - new Date(a.at);

    if (filter !== "all") {
      const pool = [
        ...main,
        ...(filter === "housing" ? data.housing.map((x) => ({ kind: "housing", key: `housing-${x.id}`, at: x.created_at, row: x })) : []),
        ...cls,
      ].filter((x) => x.kind === filter);
      return { mainStream: pool.sort(byNewest), listings: [] };
    }

    const sorted = [...main].sort(byNewest);
    const n = Math.max(sorted.length - 1, 1);
    const shuffled = sorted
      .map((item, i) => ({ item, score: 0.45 * (1 - i / n) + 0.55 * roll(item.key) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
    const shuffledListings = [...cls].sort((a, b) => roll(a.key) - roll(b.key));
    return { mainStream: shuffled, listings: shuffledListings };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filter]);

  const shown = mainStream
    .filter((x) => !pinned || x.key !== pinned.key)
    .slice(0, visible);

  // Weave in: a Buy & Sell listing after every 5th post, sponsored cards, missions
  const withExtras = useMemo(() => {
    const out = [];
    if (pinned) out.push({ ...pinned, pinned: true });
    if (filter !== "all") return [...out, ...shown];

    let li = 0;
    let mi = 0;
    shown.forEach((item, i) => {
      const n = i + 1;
      out.push(item);

      if (HUNTERS_ENABLED && n === PROMO_AT && user && !isHunter && !promoSeen) {
        out.push({ kind: "promo", key: "hunter-promo" });
      }
      if (n % LISTING_EVERY === 0 && listings.length > 0) {
        const l = listings[li % listings.length];
        li++;
        out.push({ ...l, key: `${l.key}-s${n}` });
      }
      if (n % MISSION_EVERY === 0 && quests.length > 0) {
        const q = quests[mi % quests.length];
        mi++;
        out.push({ kind: "mission", key: `mission-${q.o_quest_id}-${n}`, row: q });
      }
      if (n % AD_EVERY === 0 && data.ads.length > 0) {
        const ad = data.ads[(n / AD_EVERY - 1) % data.ads.length];
        out.push({ kind: "ad", key: `ad-${n}`, row: ad });
      }
    });
    return out;
  }, [shown, listings, quests, pinned, filter, data.ads, user, isHunter, promoSeen]);

  function renderItem(item) {
    const card = renderCard(item);
    if (!item.pinned) return card;
    return (
      <div key={item.key} className="rounded-2xl ring-2 ring-orange-500">
        {card}
      </div>
    );
  }

  function renderCard(item) {
    if (item.kind === "promo") {
      return <HunterPromoCard key={item.key} lang={lang} onDismiss={dismissPromo} />;
    }
    if (item.kind === "mission") {
      return <MissionCard key={item.key} quest={item.row} lang={lang} />;
    }
    const r = item.row;
    if (item.kind === "post") {
      return (
        <PostCard
          key={item.key}
          post={r}
          lang={lang}
          comments={comments[r.id] || []}
          onComment={addComment}
        />
      );
    }
    if (item.kind === "ad") return <AdCard key={item.key} ad={r} lang={lang} />;

    if (item.kind === "classified") {
      return (
        <ListingCard
          key={item.key}
          href="/classifieds"
          icon="🛒"
          tag={t.classified}
          tagClass="text-amber-400"
          title={r.title}
          meta={r.category}
          price={formatPrice(r.price, r.price_on_request, t)}
          image={r.image_url}
          ago={timeAgo(r.created_at, lang)}
        />
      );
    }
    if (item.kind === "housing") {
      const type = String(r.listing_type || "").toLowerCase();
      const tag = type.includes("rent") || type.includes("huur")
        ? t.forRent
        : type.includes("sale") || type.includes("sell") || type.includes("koop")
        ? t.forSale
        : r.listing_type || t.housing;
      const meta = [r.property_type, r.area, r.bedrooms ? t.bedrooms(Number(r.bedrooms)) : null]
        .filter(Boolean)
        .join(" · ");
      return (
        <ListingCard
          key={item.key}
          href="/housing"
          icon="🏠"
          tag={tag}
          tagClass="text-sky-400"
          title={r.title}
          meta={meta}
          price={formatPrice(r.price, r.price_on_request, t)}
          image={r.image_url}
          ago={timeAgo(r.created_at, lang)}
        />
      );
    }
    // job
    const seeking = String(r.type || "").toLowerCase().includes("seek");
    return (
      <ListingCard
        key={item.key}
        href="/jobs"
        icon="💼"
        tag={seeking ? t.seeking : t.hiring}
        tagClass="text-emerald-400"
        title={r.title}
        meta={r.category}
        ago={timeAgo(r.created_at, lang)}
      />
    );
  }

  const showWelcome = !authLoading && !user && !welcomeSeen;

  return (
    <main className="min-h-screen bg-carbon text-white">
      <h1 className="sr-only">{t.seo}</h1>

      <LiveTicker lang={lang} />

      <div className="mx-auto max-w-2xl space-y-3 px-4 pt-3">
        {showWelcome && (
          <section className="relative rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/15 to-neutral-900 p-4">
            <button
              onClick={dismissWelcome}
              aria-label={t.dismiss}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-sm text-neutral-300 hover:text-white"
            >
              ✕
            </button>
            <h2 className="pr-8 text-lg font-bold">{t.welcomeTitle}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{t.welcomeBody}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={signInWithGoogle}
                disabled={busy}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50"
              >
                {busy ? t.wait : t.signIn}
              </button>
              <InstallButton lang={lang} />
            </div>
          </section>
        )}

      </div>

      <FeaturedCarousel lang={lang} />

      {data.events.length > 0 && (
        <section className="mx-auto mt-3 max-w-2xl px-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">
            {t.events}
          </h2>
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {data.events.map((ev) => (
              <EventTile key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Filter chips stay under the top bar while you scroll */}
      <div className="sticky top-14 z-30 mt-3 border-y border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="scrollbar-hide mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2.5">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setFilter(chip);
                setVisible(PAGE_SIZE);
              }}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                filter === chip
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-neutral-700 text-neutral-300 hover:border-orange-500"
              }`}
            >
              {t[chip]}
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
        ) : withExtras.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">{t.empty}</p>
        ) : (
          withExtras.map(renderItem)
        )}

        {!loading && mainStream.length > visible && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full rounded-full border border-neutral-700 py-3 text-sm font-medium text-neutral-200 transition hover:border-orange-500 hover:text-orange-400"
          >
            {t.more}
          </button>
        )}

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 pt-6 text-xs text-neutral-500">
          <Link href="/mission" className="underline hover:text-orange-400">{t.mission}</Link>
          <Link href="/terms" className="underline hover:text-orange-400">{t.terms}</Link>
          <Link href="/privacy" className="underline hover:text-orange-400">{t.privacy}</Link>
          <Link href="/contact" className="underline hover:text-orange-400">{t.contact}</Link>
        </nav>
      </section>
    </main>
  );
}