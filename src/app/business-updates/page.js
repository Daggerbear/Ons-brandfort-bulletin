// app/business-updates/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

const CATEGORY_LABELS = {
  Special: { af: "Spesiaal", en: "Special" },
  "New Stock": { af: "Nuwe Voorraad", en: "New Stock" },
  Menu: { af: "Spyskaart", en: "Menu" },
  Offer: { af: "Aanbod", en: "Offer" },
  Announcement: { af: "Aankondiging", en: "Announcement" },
};

const MAX_PINNED = 7;

export default function BusinessUpdates() {
  const [lang, setLang] = useState("af");
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

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
      viewBusiness: "Besoek Besigheid",
      featured: "Uitgelig",
    },
    en: {
      heading: "Business Updates",
      sub: "Specials, new stock, and news from local businesses.",
      empty: "No updates yet. Check back soon!",
      viewBusiness: "View Business",
      featured: "Featured",
    },
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10 flex flex-col relative">
      <Nav lang={lang} />
      <div className="max-w-md mx-auto mt-8 flex-1 w-full">
        <button
          onClick={() => setLang(lang === "af" ? "en" : "af")}
          className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition mb-8"
        >
          {lang === "af" ? "English" : "Afrikaans"}
        </button>

        <h1 className="text-3xl font-bold mb-2">{t.heading}</h1>
        <p className="text-neutral-400 mb-6">{t.sub}</p>

        {loading && <p className="text-neutral-400">Loading...</p>}

        {!loading && updates.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-12">
            {t.empty}
          </p>
        )}

        <div className="space-y-4">
          {updates.map((u) => {
            const catLabel = CATEGORY_LABELS[u.category]?.[lang] || u.category;
            const biz = u.businesses;

            return (
              <div
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
                {u.image_url && (
                  <div className="relative w-full h-56 bg-neutral-950">
                    <Image
                      src={u.image_url}
                      alt={u.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {biz?.logo_url ? (
                      <Image
                        src={biz.logo_url}
                        alt={biz.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
                    )}
                    <span className="text-sm text-neutral-400 truncate">
                      {biz?.name}
                    </span>
                    <span className="ml-auto text-xs uppercase tracking-wide text-orange-400 border border-orange-500/40 rounded-full px-2 py-0.5 flex-shrink-0">
                      {catLabel}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold mb-1">{u.title}</h2>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                    {u.body}
                  </p>

                  {biz?.id && (
                    <Link
                      href={`/business/${biz.id}`}
                      className="text-sm text-orange-400 hover:text-orange-300 underline"
                    >
                      {t.viewBusiness} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating + button */}
      <Link
        href="/business-updates/submit"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 transition text-white text-3xl font-bold flex items-center justify-center shadow-lg shadow-orange-500/30 z-50"
        aria-label="Post an update"
      >
        +
      </Link>

      <Footer lang={lang} />
    </main>
  );
}