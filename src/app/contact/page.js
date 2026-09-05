"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Contact() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      title: "Kontak Ons",
      intro:
        "Het jy 'n vraag, wil jy iets regstel, of wil jy meer weet oor adverteer-geleenthede? Kontak Jaco direk — hy antwoord persoonlik.",
      topicsTitle: "Waarmee Ons Kan Help",
      topics: [
        "Besigheidslysings — nuwe lysing, veranderinge, of verwydering",
        "Gebeurtenisse — indien of regstel",
        "Gemeenskap plasings — vrae oor die feed",
        "Adverteer & borgskap — pryse en beskikbaarheid",
        "Regstellings — verkeerde inligting oor jou of jou besigheid",
        "Algemene ondersteuning — enigiets anders",
      ],
      whatsappLabel: "WhatsApp",
      whatsappDesc: "Vinnigste manier om 'n antwoord te kry",
      emailLabel: "E-pos",
      emailDesc: "Vir langer vrae of dokumente",
      whatsappMessage: "Hi, ek het hulp nodig met Ons Brandfort Bulletin...",
    },
    en: {
      title: "Contact Us",
      intro:
        "Got a question, need something corrected, or want to know more about advertising opportunities? Get in touch with Jaco directly — he replies personally.",
      topicsTitle: "What We Can Help With",
      topics: [
        "Business listings — new listing, changes, or removal",
        "Events — submitting or correcting",
        "Community posts — questions about the feed",
        "Advertising & sponsorship — pricing and availability",
        "Corrections — incorrect information about you or your business",
        "General support — anything else",
      ],
      whatsappLabel: "WhatsApp",
      whatsappDesc: "Fastest way to get a reply",
      emailLabel: "Email",
      emailDesc: "For longer questions or documents",
      whatsappMessage: "Hi, I'd like help with Ons Brandfort Bulletin...",
    },
  };

  const t = text[lang];
  const whatsappUrl = `https://wa.me/27603661384?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      <header className="border-b border-neutral-800 px-6 py-10 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-neutral-400 mt-3 max-w-md mx-auto">{t.intro}</p>
      </header>

      <section className="px-6 py-10 max-w-2xl mx-auto space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-neutral-900 border border-green-600/40 hover:border-green-500 transition rounded-2xl p-5"
        >
          <span className="text-3xl">💬</span>
          <div>
            <p className="font-semibold text-green-400">{t.whatsappLabel}</p>
            <p className="text-sm text-neutral-400">{t.whatsappDesc}</p>
          </div>
        </a>

        <a
          href="mailto:duplessisjaco978@gmail.com"
          className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-2xl p-5"
        >
          <span className="text-3xl">✉️</span>
          <div>
            <p className="font-semibold text-orange-400">{t.emailLabel}</p>
            <p className="text-sm text-neutral-400">{t.emailDesc}</p>
          </div>
        </a>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-3">
            {t.topicsTitle}
          </h2>
          <ul className="space-y-2">
            {t.topics.map((topic) => (
              <li key={topic} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-orange-400">→</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer lang={lang} />
    </main>
  );
}