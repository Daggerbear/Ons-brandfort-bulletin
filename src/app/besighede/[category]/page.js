"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { getCategoryBySlug } from "@/lib/categories";
import { SkeletonList, SkeletonBusinessListRow } from "@/components/Skeleton";

export default function CategoryBusinesses() {
  const { category: categorySlug } = useParams();
  const [lang, setLang] = useState("af");
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // null if the slug doesn't match any real category
  const categoryInfo = getCategoryBySlug(categorySlug);

  const text = {
    af: {
      back: "← Alle Kategorieë",
      search: "Soek besighede...",
      none: "Geen besighede in hierdie kategorie nie.",
      noneSearch: "Geen besighede gevind nie.",
      businesses: "besighede",
      results: "resultate",
      clear: "Maak skoon",
      notFound: "Hierdie kategorie bestaan nie.",
      beFirst: "Wees die eerste in hierdie kategorie!",
      listCta: "Lys My Besigheid",
    },
    en: {
      back: "← All Categories",
      search: "Search businesses...",
      none: "No businesses in this category yet.",
      noneSearch: "No businesses found.",
      businesses: "businesses",
      results: "results",
      clear: "Clear",
      notFound: "This category doesn't exist.",
      beFirst: "Be the first in this category!",
      listCta: "List My Business",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
      if (!categoryInfo) {
        setLoading(false);
        return;
      }
      setLoading(true);
      let query = supabase.from("businesses").select("*").eq("Status", "approved");
      if (categoryInfo.name !== "All") {
        query = query.eq("category", categoryInfo.name);
      }
      const { data } = await query.order("created_at", { ascending: false });
      setBusinesses(data || []);
      setLoading(false);
    };
    loadData();
  }, [categoryInfo?.name]);

  const term = searchTerm.trim().toLowerCase();
  const filteredBusinesses = businesses.filter((b) =>
    term === ""
      ? true
      : [b.name, b.description, ...(b.services || [])]
          .join(" ")
          .toLowerCase()
          .includes(term)
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      <header
        className="border-b border-orange-900/60 px-6 pt-6 pb-8 text-center"
        style={{
          background: "radial-gradient(circle at 20% 0%, #7c2d12, #0a0a0a 75%)",
        }}
      >
        <div className="flex justify-between items-center mb-5 max-w-2xl mx-auto">
          <Link href="/besighede" className="text-sm text-orange-400 hover:text-orange-300">
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-400 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        {categoryInfo ? (
          <>
            <div className="text-5xl mb-2">{categoryInfo.icon}</div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              {categoryInfo[lang]}
            </h1>
            {!loading && (
              <p className="text-sm text-neutral-300 mt-2">
                {businesses.length} {t.businesses}
              </p>
            )}
          </>
        ) : (
          <h1 className="text-2xl font-bold">{t.notFound}</h1>
        )}
      </header>

      <section className="px-6 py-6 max-w-2xl mx-auto">
        {categoryInfo && (
          <>
            <div className="relative mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`🔍  ${t.search}`}
                className="w-full bg-neutral-900 border border-orange-500/30 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-500 focus:border-orange-400 outline-none"
              />
              {term !== "" && (
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
              {term !== "" && !loading && (
                <p className="text-xs text-neutral-400">
                  {filteredBusinesses.length} {t.results}
                </p>
              )}
            </div>

            {loading && <SkeletonList Component={SkeletonBusinessListRow} count={4} />}

            {!loading && filteredBusinesses.length === 0 && (
              <div className="text-center mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-400">
                  {businesses.length === 0 ? t.none : t.noneSearch}
                </p>
                {businesses.length === 0 && (
                  <>
                    <p className="text-sm text-neutral-300 mt-2 mb-4">{t.beFirst}</p>
                    <Link
                      href="/list-your-business"
                      className="inline-block bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-xl px-5 py-3 text-sm"
                    >
                      🏪 {t.listCta}
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              {filteredBusinesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/business/${business.id}`}
                  className="flex gap-4 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-2xl p-4"
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
                    <p className="text-neutral-300 text-sm mt-1 line-clamp-2">
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
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}