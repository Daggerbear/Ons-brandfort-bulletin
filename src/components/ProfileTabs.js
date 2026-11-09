// src/components/ProfileTabs.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/profile", af: "Profiel", en: "Profile", icon: "👤" },
  { href: "/profile/hunter", af: "Hunter", en: "Hunter", icon: "🎯" },
  { href: "/profile/customise", af: "Pasmaak", en: "Customise", icon: "🎨", soon: true },
];

export default function ProfileTabs({ lang = "af" }) {
  const pathname = usePathname() || "/profile";
  return (
    <nav aria-label="Profile" className="mt-4 grid grid-cols-3 gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-center transition ${
              active
                ? "border-orange-500 bg-orange-500/10 text-orange-300"
                : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-xs font-semibold">{lang === "af" ? tab.af : tab.en}</span>
            {tab.soon && (
              <span className="absolute -right-1 -top-2 rounded-full bg-yellow-300 px-1.5 py-0.5 text-[9px] font-bold text-black">
                {lang === "af" ? "BINNEKORT" : "SOON"}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
