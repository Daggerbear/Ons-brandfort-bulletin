// src/components/AppShell.js
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import { LangProvider, useLang } from "@/components/LangProvider";

const COMMUNITY_PREFIXES = [
  "/feed",
  "/community",
  "/classifieds",
  "/housing",
  "/jobs",
  "/events",
  "/list-your-event",
];
const BUSINESS_PREFIXES = [
  "/business",
  "/besighede",
  "/vind",
  "/list-your-business",
];

const TABS = {
  community: {
    href: "/",
    icon: "🏘️",
    label: { af: "Gemeenskap", en: "Community" },
    match: (p) => p === "/" || COMMUNITY_PREFIXES.some((x) => p.startsWith(x)),
  },
  business: {
    href: "/business",
    icon: "🏪",
    label: { af: "Besigheid", en: "Business" },
    match: (p) => BUSINESS_PREFIXES.some((x) => p.startsWith(x)),
  },
  cafe: {
    href: "/games",
    icon: "🕹️",
    label: { af: "Glitch Cafe", en: "Glitch Cafe" },
    match: (p) => p.startsWith("/games"),
  },
  me: {
    href: "/profile",
    icon: "👤",
    label: { af: "Profiel", en: "Profile" },
    signedOutLabel: { af: "Teken in", en: "Sign in" },
    match: (p) => p.startsWith("/profile"),
  },
};

// What the + button offers on the community side, in plain words
const CREATE_COMMUNITY = [
  { icon: "💬", af: "Deel iets", en: "Share something", hintAf: "Vra, nuus, dankie", hintEn: "Ask, news, thanks", href: "/create/share" },
  { icon: "🛒", af: "Verkoop iets", en: "Sell something", hintAf: "Foto, prys, klaar", hintEn: "Photo, price, done", href: "/create/sell" },
  { icon: "🏠", af: "Huis of kamer", en: "House or room", hintAf: "Te huur of te koop", hintEn: "To rent or for sale", href: "/create/housing" },
  { icon: "💼", af: "Werk", en: "Work", hintAf: "Werkers of werk soek", hintEn: "Hiring or job seeking", href: "/create/job" },
  { icon: "📅", af: "Gebeurtenis", en: "Event", hintAf: "Vertel die dorp", hintEn: "Tell the town", href: "/create/event" },
  { icon: "🔍", af: "Verloor of gevind", en: "Lost or found", hintAf: "Help mekaar", hintEn: "Help each other", href: "/create/share?cat=lost" },
];

// ...and on the business side
const FEATURED_MSG = {
  af: "Hi Jaco, ek stel belang om my besigheid op die Bulletin uit te lig.",
  en: "Hi Jaco, I'm interested in getting my business featured on the Bulletin.",
};

const CREATE_BUSINESS = [
  { icon: "📢", af: "Plaas 'n opdatering", en: "Post an update", hintAf: "Spesiaal, nuwe voorraad", hintEn: "Special, new stock", href: "/create/update" },
  { icon: "🏪", af: "Lys my besigheid", en: "List my business", hintAf: "Gratis, almal sien jou", hintEn: "Free, everyone sees you", href: "/create/business" },
  { icon: "💼", af: "Ek soek werkers", en: "I'm hiring", hintAf: "Plaas 'n vakature", hintEn: "Post a vacancy", href: "/create/job?type=job" },
  {
    icon: "🎯",
    af: "Kry uitgelig",
    en: "Get featured",
    hintAf: "Vra Jaco oor die opsies",
    hintEn: "Ask Jaco about the options",
    external: true,
    href: (lang) => `https://wa.me/27603661384?text=${encodeURIComponent(FEATURED_MSG[lang])}`,
  },
];

const text = {
  af: {
    sos: "Nood",
    toggle: "EN",
    createTitle: "Wat wil jy plaas?",
    businessTitle: "Wat wil jy doen?",
    createAria: "Plaas iets",
  },
  en: {
    sos: "SOS",
    toggle: "AF",
    createTitle: "What do you want to post?",
    businessTitle: "What do you want to do?",
    createAria: "Post something",
  },
};

function CreateSheet({ open, onClose, lang, business }) {
  const t = text[lang];
  const pathname = usePathname();
  const items = business ? CREATE_BUSINESS : CREATE_COMMUNITY;

  // Close when the page changes
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes it, and the page behind doesn't scroll while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.createAria}
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-3xl border border-b-0 border-neutral-800 bg-neutral-950 px-5 pt-3 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-700" />
        <h2 className="mb-4 text-center text-lg font-bold text-white">
          {business ? t.businessTitle : t.createTitle}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => {
            const href = typeof item.href === "function" ? item.href(lang) : item.href;
            const wide = items.length % 2 === 1 && i === items.length - 1;
            const className = `flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-3.5 transition hover:border-orange-500 active:scale-[0.98] ${
              wide ? "col-span-2" : ""
            }`;
            const content = (
              <>
                <span className="text-3xl">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight text-white">
                    {item[lang]}
                  </span>
                  <span className="block text-[11px] leading-tight text-neutral-400">
                    {lang === "af" ? item.hintAf : item.hintEn}
                  </span>
                </span>
              </>
            );
            return item.external ? (
              <a
                key={item.en}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={item.en} href={href} onClick={onClose} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TabLink({ tab, active, lang, user }) {
  const isMe = tab === TABS.me;
  const label =
    isMe && !user ? tab.signedOutLabel[lang] : tab.label[lang];

  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center justify-center gap-0.5"
    >
      {active && (
        <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-500" />
      )}
      {isMe && user ? (
        <span
          className={`flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-full ring-2 ${
            active ? "ring-orange-500" : "ring-transparent opacity-80"
          }`}
        >
          <Avatar user={user} size={26} />
        </span>
      ) : (
        <span className={`text-xl transition ${active ? "scale-110" : "opacity-60"}`}>
          {tab.icon}
        </span>
      )}
      <span
        className={`text-[10px] font-medium transition ${
          active ? "text-orange-400" : "text-neutral-500"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function Shell({ children }) {
  const pathname = usePathname() || "/";
  const { lang, toggleLang } = useLang();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const t = text[lang];

  // Admin and sign-in screens keep their own look
  const bare = pathname.startsWith("/admin") || pathname.startsWith("/auth");
  if (bare) return children;

  // Inside a single game, and on the create pages, the tab bar steps aside
  const hideTabs = /^\/games\/.+/.test(pathname) || pathname.startsWith("/create");
  const showTabs = !hideTabs;
  const onBusiness = TABS.business.match(pathname);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={28} height={28} priority />
            <span className="text-sm font-black leading-none tracking-tight text-white">
              Ons Brandfort <span className="text-orange-500">Bulletin</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/emergency"
              className="flex items-center gap-1 rounded-full border border-red-500/50 bg-red-950/50 px-3 py-1 text-xs font-bold text-red-300 transition hover:bg-red-900/60"
            >
              <span>🚨</span>
              <span>{t.sos}</span>
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-full border border-neutral-600 px-2.5 py-1 text-xs font-semibold text-neutral-200 transition hover:border-orange-500 hover:text-orange-400"
            >
              {t.toggle}
            </button>
          </div>
        </div>
      </header>

      <div
        className="flex flex-1 flex-col"
        style={{
          paddingTop: "3.5rem",
          paddingBottom: showTabs
            ? "calc(4rem + env(safe-area-inset-bottom, 0px))"
            : 0,
        }}
      >
        {children}
      </div>

      {showTabs && (
        <>
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="mx-auto grid h-16 max-w-2xl grid-cols-5">
              <TabLink tab={TABS.community} active={TABS.community.match(pathname)} lang={lang} user={user} />
              <TabLink tab={TABS.business} active={onBusiness} lang={lang} user={user} />

              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                aria-label={t.createAria}
                className="relative -mt-5 flex items-start justify-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-3xl font-light leading-none text-black shadow-[0_0_20px_rgba(249,115,22,0.5)] ring-4 ring-neutral-950 transition hover:bg-orange-600">
                  +
                </span>
              </button>

              <TabLink tab={TABS.cafe} active={TABS.cafe.match(pathname)} lang={lang} user={user} />
              <TabLink tab={TABS.me} active={TABS.me.match(pathname)} lang={lang} user={user} />
            </div>
          </nav>
          <CreateSheet
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            lang={lang}
            business={onBusiness}
          />
        </>
      )}
    </>
  );
}

export default function AppShell({ children }) {
  return (
    <LangProvider>
      <Shell>{children}</Shell>
    </LangProvider>
  );
}
