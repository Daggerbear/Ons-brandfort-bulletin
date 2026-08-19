"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import Image from "next/image";

export default function Besighede() {
  const [lang, setLang] = useState("af");
  const [businesses, setBusinesses] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const text = {
    af: { title: "🏪 Ons Besighede", search: "Soek besighede..." },
    en: { title: "🏪 Our Businesses", search: "Search businesses..." },
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
    };
    loadData();
  }, []);

  const categories = [
    "All", "Agriculture", "Automotive", "Beauty & Spa", "Food & Dining",
    "Health & Medical", "Home Services", "Professional Services",
    "Retail & Shopping", "Other",
  ];

  const filteredBusinesses = businesses
    .filter((b) => activeCategory === "All" || b.category === activeCategory)
    .filter((b) =>
      searchTerm.trim() === ""
        ? true
        : b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
      </header>

      <section className="px-6 py-8 max-w-2xl mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.search}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-4 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-3 py-1 rounded-full border transition ${
                activeCategory === cat
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-neutral-700 text-neutral-300 hover:border-orange-500 hover:text-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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