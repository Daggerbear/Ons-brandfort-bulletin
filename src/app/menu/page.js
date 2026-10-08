"use client";
import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function MenuPage() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      heading: "Kieslys",
      items: [
        { icon: "🔎", label: "Vind 'n Diens", href: "/vind" },
        { icon: "🛒", label: "Koop & Verkoop", href: "/classifieds" },
        { icon: "💼", label: "Werk", href: "/jobs" },
        { icon: "🚨", label: "Nood Kontakte", href: "/emergency" },
        { icon: "🕹️", label: "Glitch Cafe", href: "/games" },
        { icon: "🏪", label: "Lys Jou Besigheid", href: "/list-your-business" },
        { icon: "📅", label: "Lys Jou Gebeurtenis", href: "/list-your-event" },
      ],
      legal: [
        { label: "Ons Visie & Missie", href: "/mission" },
        { label: "Kontak Ons", href: "/contact" },
        { label: "Bepalings & Voorwaardes", href: "/terms" },
        { label: "Privaatheidsbeleid", href: "/privacy" },
      ],
    },
    en: {
      heading: "Menu",
      items: [
        { icon: "🔎", label: "Find a Service", href: "/vind" },
        { icon: "🛒", label: "Buy & Sell", href: "/classifieds" },
        { icon: "💼", label: "Jobs", href: "/jobs" },
        { icon: "🚨", label: "Emergency Contacts", href: "/emergency" },
        { icon: "🕹️", label: "Glitch Cafe", href: "/games" },
        { icon: "🏪", label: "List Your Business", href: "/list-your-business" },
        { icon: "📅", label: "List Your Event", href: "/list-your-event" },
      ],
      legal: [
        { label: "Our Vision & Mission", href: "/mission" },
        { label: "Contact Us", href: "/contact" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-carbon text-white px-6 py-8">
      <Nav lang={lang} />
      <div className="max-w-2xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tight">{t.heading}</h1>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {t.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-4 flex flex-col items-center text-center gap-1.5"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium text-neutral-300">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-4 flex flex-col gap-1">
          {t.legal.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-500 hover:text-orange-400 transition py-1.5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}