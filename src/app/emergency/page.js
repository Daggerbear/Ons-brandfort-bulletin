// src/app/emergency/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SkeletonList, SkeletonBusinessListRow } from "@/components/Skeleton";

function telHref(number) {
  return `tel:${(number || "").replace(/[^\d+]/g, "")}`;
}

// Pick an icon from the category name (works in Afrikaans or English)
function iconFor(category) {
  const c = (category || "").toLowerCase();
  if (/(polisie|police|saps|sekuriteit|security)/.test(c)) return "🚓";
  if (/(ambulans|ambulance|mediese|medical|hospitaal|hospital|kliniek|clinic|dokter|doctor)/.test(c)) return "🚑";
  if (/(brandweer|brand|fire)/.test(c)) return "🚒";
  if (/(elektrisiteit|electricity|eskom|krag|power)/.test(c)) return "⚡";
  if (/(water)/.test(c)) return "💧";
  if (/(munisipal|municipal|raad|council)/.test(c)) return "🏛️";
  if (/(veearts|vet|dier|animal)/.test(c)) return "🐾";
  return "📞";
}

// Most urgent categories first
function priorityFor(category) {
  const c = (category || "").toLowerCase();
  if (/(polisie|police|saps|ambulans|ambulance|mediese|medical|hospitaal|hospital|nood|emergency)/.test(c)) return 0;
  if (/(brandweer|brand|fire)/.test(c)) return 1;
  return 2;
}

export default function Emergency() {
  const [lang, setLang] = useState("af");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const text = {
    af: {
      title1: "Nood",
      title2: "Kontakte",
      tagline: "Belangrike nommers vir Brandfort, altyd byderhand.",
      call: "Bel",
      danger: "Lewensgevaar? Bel dadelik:",
      national: "Nasionale nommers",
      cell: "Selfoon nood",
      police: "Polisie",
      ambulance: "Ambulans",
      local: "Plaaslike Kontakte",
      empty: "Geen kontakte nog nie.",
    },
    en: {
      title1: "Emergency",
      title2: "Contacts",
      tagline: "Important numbers for Brandfort, always at hand.",
      call: "Call",
      danger: "Life in danger? Call now:",
      national: "National numbers",
      cell: "Cell emergency",
      police: "Police",
      ambulance: "Ambulance",
      local: "Local Contacts",
      empty: "No contacts yet.",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadContacts = async () => {
      const { data } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      setContacts(data || []);
      setLoading(false);
    };
    loadContacts();
  }, []);

  const grouped = contacts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  const categoryOrder = Object.keys(grouped).sort((a, b) => {
    const pa = priorityFor(a);
    const pb = priorityFor(b);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });

  const quickDial = [
    { number: "112", label: t.cell, icon: "📱" },
    { number: "10111", label: t.police, icon: "🚓" },
    { number: "10177", label: t.ambulance, icon: "🚑" },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      {/* Hazard stripe */}
      <div
        className="h-2"
        style={{
          background:
            "repeating-linear-gradient(135deg, #000, #000 10px, #dc2626 10px, #dc2626 20px)",
        }}
      />

      <header
        className="border-b border-red-900/60 px-6 pt-6 pb-8 text-center"
        style={{
          background: "radial-gradient(circle at 50% 0%, #7f1d1d, #0a0a0a 75%)",
        }}
      >
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-red-400 hover:text-red-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <div className="text-5xl mb-2">🚨</div>
        <h1 className="text-3xl font-black uppercase tracking-tight">
          {t.title1} <span className="text-red-500">{t.title2}</span>
        </h1>
        <p className="text-neutral-300 text-sm mt-2">{t.tagline}</p>
      </header>

      <section className="px-6 py-6 max-w-2xl mx-auto w-full flex-1">
        {/* National quick dial */}
        <div className="bg-red-950/40 border-2 border-red-600/70 rounded-2xl p-4 mb-8">
          <p className="font-bold text-red-300 mb-3">⚠️ {t.danger}</p>
          <div className="grid grid-cols-3 gap-2">
            {quickDial.map((q) => (
              <a
                key={q.number}
                href={telHref(q.number)}
                className="flex flex-col items-center text-center gap-1 bg-red-600 hover:bg-red-700 transition rounded-xl py-3 px-1"
              >
                <span className="text-2xl">{q.icon}</span>
                <span className="text-xl font-black tabular-nums">{q.number}</span>
                <span className="text-[11px] font-semibold text-red-100 leading-tight">
                  {q.label}
                </span>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-red-300/70 mt-2 text-center">{t.national}</p>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-4">
          {t.local}
        </h2>

        {loading && <SkeletonList Component={SkeletonBusinessListRow} count={4} />}

        {!loading && contacts.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-8">{t.empty}</p>
        )}

        {categoryOrder.map((category) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              <span>{iconFor(category)}</span> {category}
            </h3>
            <div className="space-y-3">
              {grouped[category].map((c) => (
                <a
                  key={c.id}
                  href={telHref(c.number)}
                  className="flex justify-between items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-red-500 transition rounded-xl p-4"
                >
                  <div className="min-w-0">
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-sm text-neutral-400 tabular-nums">{c.number}</p>
                  </div>
                  <span className="flex-shrink-0 bg-red-600 text-white text-sm font-bold rounded-full px-4 py-2">
                    📞 {t.call}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer lang={lang} />
    </main>
  );
}