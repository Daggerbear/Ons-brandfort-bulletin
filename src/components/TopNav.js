// src/components/TopNav.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";

const TABS = [
  { href: "/", icon: "🏠", label: { af: "Tuis", en: "Home" }, match: (p) => p === "/" },
  { href: "/besighede", icon: "🏪", label: { af: "Besighede", en: "Businesses" }, match: (p) => p.startsWith("/besighede") || p.startsWith("/business") },
  { href: "/business-updates", icon: "📢", label: { af: "Opdaterings", en: "Updates" }, match: (p) => p.startsWith("/business-updates") },
  { href: "/feed", icon: "💬", label: { af: "Feed", en: "Feed" }, match: (p) => p.startsWith("/feed") || p.startsWith("/community") },
  { href: "/emergency", icon: "🚨", label: { af: "Nood", en: "Emergency" }, match: (p) => p.startsWith("/emergency") },
  // Added Radio Tab here
  { href: "https://veldbrandradio.co.za", icon: "📻", label: { af: "Radio", en: "Radio" }, match: () => false, external: true },
];

export default function TopNav({ lang = "af" }) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      {/* Changed to grid-cols-7 to fit the new radio tab */}
      <div className="max-w-2xl mx-auto grid grid-cols-7">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const content = (
            <>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
              <span className={`text-xl transition ${active ? "scale-110" : "opacity-60"}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-medium transition ${active ? "text-orange-400" : "text-neutral-500"}`}>
                {tab.label[lang]}
              </span>
            </>
          );

          if (tab.external) {
            return (
              <a
                key={tab.href}
                href={tab.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
            >
              {content}
            </Link>
          );
        })}
        <AuthButton lang={lang} variant="tab" />
      </div>
    </nav>
  );
}