// src/components/helper/HelperCards.js
// The cards Lientjie shows inside the chat: businesses, events and menu items.
"use client";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  businessHref,
  menuHref,
  eventHref,
  money,
  whatsappNumber,
} from "@/components/helper/helperData";
import { openStatus } from "@/lib/bot/botHours";

const WORDS = {
  af: { open: "Nou oop", closed: "Toe", always: "24 uur oop", until: (t) => `tot ${t}`, page: "🏪 Bladsy" },
  en: { open: "Open now", closed: "Closed", always: "Open 24h", until: (t) => `until ${t}`, page: "🏪 Page" },
};

// A small green / grey pill that says whether the business is open right now
function StatusBadge({ hours, lang }) {
  if (!hours || !String(hours).trim()) return null;
  const st = openStatus(hours);
  if (!st.known) return null;
  const w = WORDS[lang] || WORDS.af;
  if (st.open) {
    return (
      <span
        title={st.closesAt ? w.until(st.closesAt) : undefined}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {st.always ? w.always : w.open}
      </span>
    );
  }
  return (
    <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
      {w.closed}
    </span>
  );
}

const glass = "rounded-2xl border border-white/10 bg-white/[0.05]";

export function EventCard({ e, onNavigate }) {
  return (
    <Link
      href={eventHref(e.id)}
      onClick={onNavigate}
      className={`${glass} block border-l-[3px] border-l-orange-500 p-3 transition hover:border-orange-500/60`}
    >
      <h3 className="text-[15px] font-semibold leading-snug text-white">{e.title}</h3>
      {(e.date || e.time) && (
        <p className="mt-1 text-[13px] text-orange-300">📅 {[e.date, e.time].filter(Boolean).join(" · ")}</p>
      )}
      {e.location && <p className="mt-0.5 text-[13px] text-neutral-400">📍 {e.location}</p>}
    </Link>
  );
}

export function BusinessCard({ b, menuMode, t, lang = "af", onNavigate }) {
  const w = WORDS[lang] || WORDS.af;
  const wa = whatsappNumber(b.contact);
  const digits = (b.contact || "").replace(/[^\d+]/g, "");
  const canCall = !wa && digits.length >= 7;
  const hours = b.hours && String(b.hours).trim();

  const btn =
    "flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-center text-[13px] font-semibold transition";

  return (
    <div className={`${glass} overflow-hidden`}>
      <Link href={businessHref(b.id)} onClick={onNavigate} className="block p-3 transition hover:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <SafeImage
            src={b.logo_url}
            alt={`${b.name} logo`}
            width={48}
            height={48}
            className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/10 object-cover"
            fallback={
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl">
                🏪
              </div>
            }
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 text-[15px] font-bold leading-snug text-white">{b.name}</h3>
              <StatusBadge hours={b.hours} lang={lang} />
            </div>
            <p className="mt-0.5 text-[12px] text-neutral-400">{b.category}</p>
          </div>
        </div>

        {b.services?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {b.services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-0.5 text-[11px] text-orange-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2.5 space-y-1 text-[13px] text-neutral-300">
          {hours && <p className="whitespace-pre-line">🕒 {hours.slice(0, 120)}</p>}
          {b.address && <p className="text-neutral-400">📍 {String(b.address).slice(0, 90)}</p>}
          {b.contact && <p className="text-neutral-400">📞 {b.contact}</p>}
        </div>
      </Link>

      <div className="flex flex-wrap gap-2 border-t border-white/10 bg-black/20 p-2.5">
        {menuMode && (
          <Link
            href={menuHref(b.id)}
            onClick={onNavigate}
            className={`${btn} bg-orange-500 text-black hover:bg-orange-400`}
          >
            {menuMode === "enquiry" ? t.servicesBtn : t.menuBtn}
          </Link>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(t.waGreet(b.name))}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} bg-green-600 text-white hover:bg-green-500`}
          >
            {t.waBtn}
          </a>
        )}
        {canCall && (
          <a href={`tel:${digits}`} className={`${btn} border border-white/15 bg-white/10 text-white hover:bg-white/15`}>
            {t.callBtn}
          </a>
        )}
        {!menuMode && !wa && !canCall && (
          <Link
            href={businessHref(b.id)}
            onClick={onNavigate}
            className={`${btn} border border-white/15 bg-white/10 text-white hover:bg-white/15`}
          >
            {w.page}
          </Link>
        )}
      </div>
    </div>
  );
}

export function MenuHitRow({ h, onNavigate }) {
  return (
    <Link
      href={menuHref(h.business_id)}
      onClick={onNavigate}
      className={`${glass} flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition hover:border-orange-500/60`}
    >
      <span className="min-w-0 text-neutral-200">
        🍽️ {h.name}
        <span className="text-neutral-500"> · {h.businessName}</span>
      </span>
      <span className="flex-shrink-0 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[13px] font-bold text-orange-300">
        {money(h.price)}
      </span>
    </Link>
  );
}
