"use client";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [lang, setLang] = useState("af");
  const [events, setEvents] = useState([]);

  const text = {
    af: {
      tagline: "Die hart van Brandfort, op een plek.",
      events: "🔥 Wat Gebeur",
      footer: "Gebou deur Jaco du Plessis — vir Brandfort, deur Brandfort.",
      cards: [
        { title: "🏪 Ons Besighede", desc: "Deurblaai plaaslike besighede volgens kategorie.", href: "/besighede" },
        { title: "❓ Brandfort Vra", desc: "Vra iets, kry hulp van die gemeenskap.", href: "/brandfort-vra" },
        { title: "🐾 Verlore & Gevind", desc: "Help mekaar om verlore items te vind.", href: "/lost-found" },
        { title: "📣 Shoutouts", desc: "Verjaardae, dankie-boodskappe, en meer.", href: "/shoutouts" },
        { title: "🚨 Nood Kontakte", desc: "Belangrike nommers altyd byderhand.", href: "/emergency" },
      ],
    },
    en: {
      tagline: "The heart of Brandfort, in one place.",
      events: "🔥 What's Happening",
      footer: "Built by Jaco du Plessis — for Brandfort, by Brandfort.",
      cards: [
        { title: "🏪 Our Businesses", desc: "Browse local businesses by category.", href: "/besighede" },
        { title: "❓ Brandfort Ask", desc: "Ask something, get help from the community.", href: "/brandfort-vra" },
        { title: "🐾 Lost & Found", desc: "Help each other find lost items.", href: "/lost-found" },
        { title: "📣 Shoutouts", desc: "Birthdays, thank-yous, and more.", href: "/shoutouts" },
        { title: "🚨 Emergency Contacts", desc: "Important numbers always at hand.", href: "/emergency" },
      ],
    },
  };

  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setEvents(eventData || []);
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Ons Brandfort Bulletin" width={140} height={140} priority />
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
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">{t.events}</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="flex gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-orange-500 transition"
            >
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-14 h-14 object-cover rounded-lg border border-neutral-800 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-orange-400">{event.title}</h3>
                <p className="text-sm text-neutral-400 mt-1">{event.date} • {event.time}</p>
                <p className="text-sm text-neutral-400">{event.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick-link cards */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <div className="space-y-3">
          {t.cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-5"
            >
              <h2 className="text-lg font-semibold text-orange-400">{c.title}</h2>
              <p className="text-sm text-neutral-400 mt-1">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action Buttons */}
      <section className="px-6 py-10 max-w-md mx-auto flex flex-col gap-4">
        <a href="/list-your-business" className="w-full text-center bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3">
          {lang === "af" ? "Lys Jou Besigheid" : "List Your Business"}
        </a>
        <a href="/list-your-event" className="w-full text-center border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition font-semibold rounded-lg px-4 py-3">
          {lang === "af" ? "Lys Jou Gebeurtenis" : "List Your Event"}
        </a>
      </section>

      <footer className="border-t border-neutral-800 px-6 py-8 text-center text-neutral-500 text-sm">
        {t.footer}
      </footer>
    </main>
  );
}