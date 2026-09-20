// src/app/business/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import SafeImage from "@/components/SafeImage";
import { CATEGORIES } from "@/lib/categories";

const UPDATE_LABELS = {
  Special: { af: "Spesiaal", en: "Special", icon: "🔥" },
  "New Stock": { af: "Nuwe Voorraad", en: "New Stock", icon: "📦" },
  Menu: { af: "Spyskaart", en: "Menu", icon: "🍽️" },
  Offer: { af: "Aanbod", en: "Offer", icon: "🏷️" },
  Announcement: { af: "Aankondiging", en: "Announcement", icon: "📣" },
};

const text = {
  af: {
    title: "Besigheid",
    tagline: "Alles wat plaaslike besighede laat groei.",
    statBusinesses: "Besighede",
    statJobs: "Vakatures",
    findTitle: "Vind 'n Diens",
    findDesc: "Soek 'n loodgieter, kapper, dokter? Sê vir ons wat jy nodig het.",
    findCta: "Soek Nou",
    updates: "📢 Nuutste Opdaterings",
    categories: "🏪 Blaai per Kategorie",
    recent: "✨ Nuut op die Bulletin",
    jobs: "💼 Vakatures",
    seeAll: "Sien alles →",
    allBusinesses: "Alle Besighede",
    noJobs: "Geen oop vakatures nie.",
    by: "deur",
    listBusiness: "Lys Jou Besigheid",
    postJob: "Plaas 'n Vakature",
    ctaTitle: "Is jy 'n plaaslike besigheid?",
    ctaDesc: "Lys jou besigheid gratis en bereik die hele dorp.",
  },
  en: {
    title: "Business",
    tagline: "Everything that helps local business grow.",
    statBusinesses: "Businesses",
    statJobs: "Open Jobs",
    findTitle: "Find a Service",
    findDesc: "Need a plumber, hairdresser, doctor? Tell us what you're looking for.",
    findCta: "Search Now",
    updates: "📢 Latest Updates",
    categories: "🏪 Browse by Category",
    recent: "✨ New on the Bulletin",
    jobs: "💼 Job Openings",
    seeAll: "See all →",
    allBusinesses: "All Businesses",
    noJobs: "No open jobs right now.",
    by: "by",
    listBusiness: "List Your Business",
    postJob: "Post a Job",
    ctaTitle: "Own a local business?",
    ctaDesc: "List your business for free and reach the whole town.",
  },
};

function SectionHeader({ title, href, cta }) {
  return (
    <div className="flex items-end justify-between px-6 max-w-2xl mx-auto mb-4">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-orange-400 hover:text-orange-300 flex-shrink-0 ml-3">
          {cta}
        </Link>
      )}
    </div>
  );
}

export default function BusinessHub() {
  const [lang, setLang] = useState("af");
  const [bgUrl, setBgUrl] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const t = text[lang];

  useEffect(() => {
    const load = async () => {
      const [bgRes, bizRes, updRes, jobRes] = await Promise.all([
        supabase.from("site_images").select("url").eq("key", "business_zone_bg").maybeSingle(),
        supabase
          .from("businesses")
          .select("id, name, logo_url, category, created_at")
          .eq("Status", "approved")
          .order("created_at", { ascending: false }),
        supabase
          .from("business_updates")
          .select("id, title, category, image_url, is_pinned, businesses(id, name, logo_url)")
          .eq("Status", "approved")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("jobs")
          .select("id, title, name, type, is_filled, created_at")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setBgUrl(bgRes.data?.url || null);
      setBusinesses(bizRes.data || []);
      setUpdates(updRes.data || []);
      setJobs(jobRes.data || []);
      setLoaded(true);
    };
    load();
  }, []);

  const openJobs = jobs.filter((j) => j.type === "job" && !j.is_filled);
  const recent = businesses.slice(0, 4);
  const catChips = CATEGORIES.filter((c) => c.slug !== "all")
    .map((c) => ({ ...c, count: businesses.filter((b) => b.category === c.name).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      {/* Hero */}
      <header
        className="relative overflow-hidden border-b border-orange-900/60 px-6 pt-8 pb-10 text-center"
        style={{ background: "radial-gradient(circle at 30% 20%, #7c2d12, #0a0a0a 75%)" }}
      >
        {bgUrl && (
          <SafeImage src={bgUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(67,20,7,0.7), rgba(10,10,10,0.95))" }}
        />
        <div className="relative z-10">
          <div className="flex justify-end mb-6 max-w-2xl mx-auto">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-400 hover:text-orange-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>
          <div className="text-5xl mb-3">🏗️</div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="text-orange-400">{t.title}</span>
          </h1>
          <p className="text-neutral-300 mt-3 max-w-md mx-auto">{t.tagline}</p>

          <div className="mt-6 flex justify-center gap-10">
            <div>
              <p className="text-3xl font-black text-orange-400 tabular-nums">
                {loaded ? businesses.length : "–"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{t.statBusinesses}</p>
            </div>
            <div className="w-px bg-neutral-800" />
            <div>
              <p className="text-3xl font-black text-orange-400 tabular-nums">
                {loaded ? openJobs.length : "–"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{t.statJobs}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Find a Service */}
      <section className="px-6 pt-8 max-w-2xl mx-auto w-full">
        <Link
          href="/vind"
          className="block rounded-2xl p-5 border-2 transition hover:scale-[1.01]"
          style={{
            borderColor: "#22d3ee",
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(16,185,129,0.12)), #0a0a0a",
            boxShadow: "0 0 24px rgba(34,211,238,0.25)",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔎</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black uppercase tracking-wide text-cyan-400">
                {t.findTitle}
              </h2>
              <p className="text-sm text-neutral-300 mt-1">{t.findDesc}</p>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-cyan-400 text-black flex-shrink-0">
              {t.findCta}
            </span>
          </div>
        </Link>
      </section>

      <div className="mt-6">
        <FeaturedCarousel lang={lang} />
      </div>

      {/* Latest updates */}
      {updates.length > 0 && (
        <section className="pt-8">
          <SectionHeader title={t.updates} href="/business-updates" cta={t.seeAll} />
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
            {updates.map((u) => {
              const label = UPDATE_LABELS[u.category];
              return (
                <Link
                  key={u.id}
                  href="/business-updates"
                  className="relative flex-shrink-0 w-60 h-64 rounded-2xl overflow-hidden snap-start border border-amber-500/30 hover:border-amber-400 transition bg-neutral-900"
                >
                  <SafeImage
                    src={u.image_url}
                    alt={u.title}
                    fill
                    sizes="240px"
                    className="object-cover"
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-amber-950 to-neutral-900">
                        📢
                      </div>
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  {label && (
                    <div className="absolute top-3 left-3 bg-amber-400 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                      {label.icon} {label[lang]}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-base font-black leading-tight line-clamp-2">{u.title}</h3>
                    <p className="text-xs text-neutral-300 mt-1 truncate">{u.businesses?.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      {catChips.length > 0 && (
        <section className="pt-8">
          <SectionHeader title={t.categories} href="/besighede" cta={t.allBusinesses + " →"} />
          <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide">
            {catChips.map((c) => (
              <Link
                key={c.slug}
                href={`/besighede/${c.slug}`}
                className="flex-shrink-0 flex flex-col items-center text-center gap-1 bg-neutral-900 border border-orange-500/30 hover:border-orange-400 transition rounded-2xl px-4 py-3 w-28"
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="text-xs font-semibold leading-tight">{c[lang]}</span>
                <span className="text-[11px] text-neutral-500">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently added */}
      {recent.length > 0 && (
        <section className="pt-8">
          <SectionHeader title={t.recent} href="/besighede/all" cta={t.seeAll} />
          <div className="grid grid-cols-2 gap-3 px-6 max-w-2xl mx-auto">
            {recent.map((b) => {
              const cat = CATEGORIES.find((c) => c.name === b.category);
              return (
                <Link
                  key={b.id}
                  href={`/business/${b.id}`}
                  className="flex flex-col items-center text-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-2xl p-4"
                >
                  <SafeImage
                    src={b.logo_url}
                    alt={b.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-xl border border-neutral-800"
                    fallback={
                      <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl">
                        {cat?.icon || "🏪"}
                      </div>
                    }
                  />
                  <p className="text-sm font-semibold text-orange-400 leading-tight line-clamp-2">
                    {b.name}
                  </p>
                  {cat && (
                    <p className="text-[11px] text-neutral-500">
                      {cat.icon} {cat[lang]}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Jobs */}
      <section className="pt-8">
        <SectionHeader title={t.jobs} href="/jobs" cta={t.seeAll} />
        <div className="px-6 max-w-2xl mx-auto space-y-2">
          {loaded && openJobs.length === 0 && (
            <p className="text-neutral-500 text-sm">{t.noJobs}</p>
          )}
          {openJobs.slice(0, 3).map((j) => (
            <Link
              key={j.id}
              href="/jobs"
              className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl px-4 py-3"
            >
              <span className="text-2xl">💼</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{j.title}</p>
                <p className="text-xs text-neutral-500 truncate">
                  {t.by} {j.name}
                </p>
              </div>
              <span className="text-orange-400">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 max-w-2xl mx-auto w-full">
        <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-6 text-center">
          <p className="font-black text-lg">{t.ctaTitle}</p>
          <p className="text-sm text-neutral-400 mt-1 mb-5">{t.ctaDesc}</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/list-your-business"
              className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-xl px-3 py-3 text-sm"
            >
              🏪 {t.listBusiness}
            </Link>
            <Link
              href="/jobs"
              className="border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition font-semibold rounded-xl px-3 py-3 text-sm"
            >
              💼 {t.postJob}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </main>
  );
}