"use client";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function Home() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      tagline: "Die hart van Brandfort, op een plek.",
      events: "🔥 Wat Gebeur",
      businesses: "🏪 Ons Besighede",
      footer: "Gebou deur Jaco du Plessis — vir Brandfort, deur Brandfort.",
    },
    en: {
      tagline: "The heart of Brandfort, in one place.",
      events: "🔥 What's Happening",
      businesses: "🏪 Our Businesses",
      footer: "Built by Jaco du Plessis — for Brandfort, by Brandfort.",
    },
  };

  const t = text[lang];

  const [events, setEvents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const loadData = async () => {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      const { data: bizData } = await supabase
        .from("businesses")
        .select("*")
        .eq("Status", "approved")
        .order("created_at", { ascending: false });

      setEvents(eventData || []);
      setBusinesses(bizData || []);
    };

    loadData();
  }, []);

  const categories = [
    "All",
    "Agriculture",
    "Automotive",
    "Beauty & Spa",
    "Food & Dining",
    "Health & Medical",
    "Home Services",
    "Professional Services",
    "Retail & Shopping",
    "Other",
  ];

  const filteredBusinesses =
    activeCategory === "All"
      ? businesses
      : businesses.filter((b) => b.category === activeCategory);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Ons <span className="text-orange-500">Brandfort Bulletin</span>
        </h1>
        <p className="text-neutral-400 mt-2">{t.tagline}</p>
        <p className="text-neutral-500 mt-4 text-sm max-w-md mx-auto">
          {lang === "af"
            ? "'n Gratis platform waar elke plaaslike besigheid en gemeenskapsgeleentheid op een plek is."
            : "A free platform where every local business and community event lives in one place."}
        </p>
      </header>

      {/* Events Section */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          {t.events}
        </h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-orange-400">
                {event.title}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                {event.date} • {event.time}
              </p>
              <p className="text-sm text-neutral-400">{event.location}</p>
              <p className="text-neutral-300 mt-2">{event.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Businesses Section */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          {t.businesses}
        </h2>

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
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="w-14 h-14 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-orange-400">
                  {business.name}
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {business.category}
                </p>
                <p className="text-neutral-300 mt-2">{business.description}</p>
                <p className="text-sm text-neutral-400 mt-2">
                  📞 {business.contact}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action Buttons */}
      <section className="px-6 py-10 max-w-md mx-auto flex flex-col gap-4">
        <a
          href="/list-your-business"
          className="w-full text-center bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3"
        >
          {lang === "af" ? "Lys Jou Besigheid" : "List Your Business"}
        </a>
        <a
          href="/list-your-event"
          className="w-full text-center border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition font-semibold rounded-lg px-4 py-3"
        >
          {lang === "af" ? "Lys Jou Gebeurtenis" : "List Your Event"}
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-6 py-8 text-center text-neutral-500 text-sm">
        {t.footer}
      </footer>
    </main>
  );
}
