"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function Emergency() {
  const [lang, setLang] = useState("af");
  const [contacts, setContacts] = useState([]);

  const text = {
    af: {
      title1: "Nood",
      title2: "Kontakte",
      tagline: "Belangrike nommers vir Brandfort, altyd byderhand.",
      call: "Bel",
    },
    en: {
      title1: "Emergency",
      title2: "Contacts",
      tagline: "Important numbers for Brandfort, always at hand.",
      call: "Call",
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
    };
    loadContacts();
  }, []);

  const grouped = contacts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

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
        <h1 className="text-3xl font-bold">
          {t.title1} <span className="text-orange-500">{t.title2}</span>
        </h1>
        <p className="text-neutral-400 mt-2">{t.tagline}</p>
      </header>

      <section className="px-6 py-8 max-w-2xl mx-auto">
        {Object.keys(grouped).map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold text-orange-400 mb-3">{category}</h2>
            <div className="space-y-3">
              {grouped[category].map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.number.replace(/\s/g, "")}`}
                  className="flex justify-between items-center bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-4"
                >
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-sm text-neutral-400">{c.number}</p>
                  </div>
                  <span className="text-orange-400 text-sm font-semibold">📞 {t.call}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}