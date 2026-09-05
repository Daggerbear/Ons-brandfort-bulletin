"use client";
import { useState } from "react";

export default function Nav({ lang }) {
  const [open, setOpen] = useState(false);

  const text = {
    af: {
      home: "Tuisblad",
      besighede: "Ons Besighede",
      business: "Lys Besigheid",
      event: "Lys Gebeurtenis",
      feed: "Gemeenskap Feed",
      classifieds: "Koop & Verkoop",
      jobs: "Werk",
      emergency: "Nood Kontakte",
      games: "Glitch Cafe",
      mission: "Ons Visie & Missie",
      terms: "Bepalings & Voorwaardes",
      privacy: "Privaatheidsbeleid",
      menu: "Kieslys",
    },
    en: {
      home: "Home",
      besighede: "Our Businesses",
      business: "List Business",
      event: "List Event",
      feed: "Community Feed",
      classifieds: "Buy & Sell",
      jobs: "Jobs",
      emergency: "Emergency",
      games: "Glitch Cafe",
      mission: "Our Vision & Mission",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      menu: "Menu",
    },
  };
  const t = text[lang] || text.af;

  const links = [
    { label: t.home, href: "/" },
    { label: t.besighede, href: "/besighede" },
    { label: t.business, href: "/list-your-business" },
    { label: t.event, href: "/list-your-event" },
    { label: t.feed, href: "/feed" },
    { label: t.classifieds, href: "/classifieds" },
    { label: t.jobs, href: "/jobs" },
    { label: t.emergency, href: "/emergency" },
    { label: t.games, href: "/games" },
  ];

  const footerLinks = [
    { label: t.mission, href: "/mission" },
    { label: t.terms, href: "/terms" },
    { label: t.privacy, href: "/privacy" },
  ];

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950 text-sm relative z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <a href="/" className="text-neutral-200 font-semibold hover:text-orange-400 transition">
          {t.home}
        </a>
        <button
          onClick={() => setOpen(!open)}
          className="text-neutral-300 hover:text-orange-400 transition flex items-center gap-2"
        >
          {t.menu}
          <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="flex flex-col border-t border-neutral-800">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-neutral-300 hover:text-orange-400 hover:bg-neutral-900 transition border-b border-neutral-900 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-neutral-800">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3 text-neutral-500 text-xs hover:text-orange-400 hover:bg-neutral-900 transition border-b border-neutral-900 last:border-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}