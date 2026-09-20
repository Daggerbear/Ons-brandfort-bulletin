// src/app/besighede/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { expandQuery, tokenize, stem } from "@/lib/searchSynonyms";
import { SkeletonList, SkeletonBusinessListRow, SkeletonText } from "@/components/Skeleton";
import { CATEGORIES } from "@/lib/categories";

function matchesStructured(business, term) {
  const structuredText = [business.name, business.category, ...(business.services || [])]
    .join(" ")
    .toLowerCase();

  if (term.includes(" ")) return structuredText.includes(term);

  const words = new Set(tokenize(structuredText).map(stem));
  return words.has(stem(term));
}

function matchesDescription(business, term) {
  const desc = (business.description || "").toLowerCase();
  if (term.includes(" ")) return desc.includes(term);

  const words = new Set(tokenize(desc).map(stem));
  return words.has(stem(term));
}

export default function Besighede() {
  const [lang, setLang] = useState("af");
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState(null);

  const text = {
    af: {
      title: "🏪 Ons Besighede",
      subtitle: "Kies 'n kategorie om plaaslike besighede te ontdek",
      businesses: "besighede",
      search: "Soek besighede of dienste...",
      none: "Geen besighede gevind nie.",
      results: "resultate",
      clear: "Maak skoon",
      notFoundTitle: "Kry nie wat jy soek nie?",
      notFoundCta: "Probeer Vind 'n Diens",
      listTitle: "Is jou besigheid nie hier nie?",
      listDesc: "Lys dit gratis en bereik die hele dorp.",
      listCta: "Lys My Besigheid",
    },
    en: {
      title: "🏪 Our Businesses",
      subtitle: "Choose a category to discover local businesses",
      businesses: "businesses",
      search: "Search businesses or services...",
      none: "No businesses found.",
      results: "results",
      clear: "Clear",
      notFoundTitle: "Can't find what you need?",
      notFoundCta: "Try Find a Service",
      listTitle: "Is your business not here?",
      listDesc: "List it for free and reach the whole town.",
      listCta: "List My Business",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("Status", "approved")
        .order("created_at", { ascending: false });
      setBusinesses(data || []);
      setLoading(false);
    };
    loadData();

    const loadBg = async () => {
      const { data } = await supabase
        .from("site_images")
        .select("url")
        .eq("key", "business_zone_bg")
        .maybeSingle();
      setBgUrl(data?.url || null);
    };
    loadBg();
  }, []);

  const countFor = (categoryName) => {
    if (categoryName === "All") return businesses.length;
    return businesses.filter((b) => b.category === categoryName).length;
  };

  const catByName = (name) => CATEGORIES.find((c) => c.name === name);

  const isSearching = searchTerm.trim() !== "";
  const expandedTerms = expandQuery(searchTerm);

  const strongResults = businesses.filter((b) =>
    expandedTerms.some((term) => matchesStructured(b, term))
  );

  const weakResults =
    strongResults.length === 0
      ? businesses.filter((b) => expandedTerms.some((term) => matchesDescription(b, term)))
      : [];

  const searchResults = [...strongResults, ...weakResults];

  // Once loaded, hide categories with no businesses (keeps "All")
  const visibleCategories = loading
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.slug === "all" || countFor(c.name) > 0);

  const allCat = visibleCategories.find((c) => c.slug === "all");
  const otherCats = visibleCategories.filter((c) => c.slug !== "all");

  return (
    <main className="min-h-screen text-white bg-neutral-950 relative">
      {bgUrl && (
        <div className="fixed inset-0 -z-10">
          <SafeImage src={bgUrl} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-950/80 to-neutral-950/95" />
        </div>
      )}

      <header className="px-6 pt-8 pb-6 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-400 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight">{t.title}</h1>
        <p className="text-neutral-300 mt-2 text-sm">{t.subtitle}</p>
      </header>

      <section className="px-6 pb-16 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative mb-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`🔍  ${t.search}`}
            className="w-full bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-500 focus:border-orange-400 outline-none"
          />
          {isSearching && (
            <button
              onClick={() => setSearchTerm("")}
              aria-label={t.clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="h-6 mb-3">
          {isSearching && !loading && (
            <p className="text-xs text-neutral-400">
              {searchResults.length} {t.results}
            </p>
          )}
        </div>

        {isSearching ? (
          loading ? (
            <SkeletonList Component={SkeletonBusinessListRow} count={3} />
          ) : (
            <div className="space-y-3">
              {searchResults.length === 0 && (
                <div className="text-center mt-8 bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
                  <p className="text-neutral-400 mb-1">{t.none}</p>
                  <p className="text-sm text-neutral-300 mb-4">{t.notFoundTitle}</p>
                  <Link
                    href="/vind"
                    className="inline-block text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 transition"
                  >
                    🔎 {t.notFoundCta}
                  </Link>
                </div>
              )}
              {searchResults.map((business) => {
                const cat = catByName(business.category);
                return (
                  <Link
                    key={business.id}
                    href={`/business/${business.id}`}
                    className="flex gap-4 bg-black/40 backdrop-blur-sm border border-orange-500/30 hover:border-orange-400 transition rounded-2xl p-4"
                  >
                    <SafeImage
                      src={business.logo_url}
                      alt={`${business.name} logo`}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                      fallback={
                        <div className="w-14 h-14 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
                      }
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-orange-400">{business.name}</h3>
                      <p className="text-sm text-neutral-400 mt-1">
                        {cat ? `${cat.icon} ${cat[lang]}` : business.category}
                      </p>
                      <p className="text-neutral-300 text-sm mt-2 line-clamp-2">
                        {business.description}
                      </p>
                      {business.services?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {business.services.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-neutral-400 mt-2">📞 {business.contact}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <>
            {/* All Businesses banner */}
            {allCat && (
              <Link
                href={`/besighede/${allCat.slug}`}
                className="flex items-center gap-4 mb-3 rounded-2xl p-5 border-2 border-orange-400/60 hover:border-orange-400 transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(249,115,22,0.25), rgba(234,88,12,0.12)), rgba(0,0,0,0.5)",
                }}
              >
                <span className="text-4xl">{allCat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase tracking-wide text-lg text-orange-300">
                    {allCat[lang]}
                  </p>
                  {loading ? (
                    <SkeletonText width="w-20" className="h-3 mt-1" />
                  ) : (
                    <p className="text-sm text-neutral-300">
                      {countFor(allCat.name)} {t.businesses}
                    </p>
                  )}
                </div>
                <span className="text-orange-300 text-2xl">→</span>
              </Link>
            )}

            {/* Category tiles */}
            <div className="grid grid-cols-2 gap-3">
              {otherCats.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/besighede/${cat.slug}`}
                  className="flex flex-col items-center text-center gap-1.5 bg-black/40 backdrop-blur-sm border border-orange-500/30 hover:border-orange-400 transition rounded-2xl p-5"
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="font-semibold text-white leading-tight">{cat[lang]}</span>
                  {loading ? (
                    <SkeletonText width="w-16" className="h-3" />
                  ) : (
                    <span className="text-sm text-neutral-400">
                      {countFor(cat.name)} {t.businesses}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* List your business */}
            <div className="mt-8 bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-5 text-center">
              <p className="font-bold">{t.listTitle}</p>
              <p className="text-sm text-neutral-400 mt-1 mb-4">{t.listDesc}</p>
              <Link
                href="/list-your-business"
                className="inline-block bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-xl px-5 py-3 text-sm"
              >
                🏪 {t.listCta}
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}