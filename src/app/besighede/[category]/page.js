"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { name: "All", slug: "all", icon: "🏪" },
  { name: "Agriculture", slug: "agriculture", icon: "🌾" },
  { name: "Automotive", slug: "automotive", icon: "🚗" },
  { name: "Beauty & Spa", slug: "beauty-spa", icon: "💅" },
  { name: "Food & Dining", slug: "food-dining", icon: "🍽️" },
  { name: "Health & Medical", slug: "health-medical", icon: "🏥" },
  { name: "Home Services", slug: "home-services", icon: "🏠" },
  { name: "Professional Services", slug: "professional-services", icon: "💼" },
  { name: "Retail & Shopping", slug: "retail-shopping", icon: "🛍️" },
  { name: "Other", slug: "other", icon: "📦" },
];

export default function CategoryBusinesses() {
  const { category: categorySlug } = useParams();
  const [lang, setLang] = useState("af");
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryInfo =
    CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];

  const text = {
    af: {
      back: "← Alle Kategorieë",
      search: "Soek besighede...",
      none: "Geen besighede in hierdie kategorie nie.",
    },
    en: {
      back: "← All Categories",
      search: "Search businesses...",
      none: "No businesses in this category yet.",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
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
  }, [categoryInfo.name]);

  const filteredBusinesses = businesses.filter((b) =>
    searchTerm.trim() === ""
      ? true
      : b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto">
          <Link href="/besighede" className="text-sm text-orange-400 hover:text-orange-300">
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-2xl font-bold">
          {categoryInfo.icon} {categoryInfo.name}
        </h1>
      </header>

      <section className="px-6 py-8 max-w-2xl mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.search}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-6 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
        />

        {loading && <p className="text-neutral-400">Loading...</p>}

        {!loading && filteredBusinesses.length === 0 && (
          <p className="text-neutral-500 text-center mt-10">{t.none}</p>
        )}

        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <Link
              key={business.id}
              href={`/business/${business.id}`}
              className="flex gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-orange-500 transition"
            >
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-orange-400">{business.name}</h3>
                <p className="text-sm text-neutral-400 mt-1">{business.category}</p>
                <p className="text-neutral-300 mt-2 line-clamp-2">{business.description}</p>
                <p className="text-sm text-neutral-400 mt-2">📞 {business.contact}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}