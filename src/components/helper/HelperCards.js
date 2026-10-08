// src/components/helper/HelperCards.js
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

export function EventCard({ e, onNavigate }) {
  return (
    <Link
      href={eventHref(e.id)}
      onClick={onNavigate}
      className="block bg-neutral-900 border border-neutral-800 rounded-xl p-3 hover:border-orange-500 transition"
    >
      <h3 className="text-sm font-semibold text-orange-400">{e.title}</h3>
      {(e.date || e.time) && (
        <p className="text-xs text-neutral-300 mt-0.5">
          📅 {[e.date, e.time].filter(Boolean).join(" · ")}
        </p>
      )}
      {e.location && <p className="text-xs text-neutral-400 mt-0.5">📍 {e.location}</p>}
    </Link>
  );
}

export function BusinessCard({ b, menuMode, t, onNavigate }) {
  const wa = whatsappNumber(b.contact);
  const digits = (b.contact || "").replace(/[^\d+]/g, "");
  const canCall = !wa && digits.length >= 7;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
      <Link
        href={businessHref(b.id)}
        onClick={onNavigate}
        className="flex gap-3 hover:opacity-90 transition"
      >
        <SafeImage
          src={b.logo_url}
          alt={`${b.name} logo`}
          width={40}
          height={40}
          className="w-10 h-10 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
          fallback={
            <div className="w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
          }
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-orange-400">{b.name}</h3>
          <p className="text-xs text-neutral-400">{b.category}</p>
          {b.services?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {b.services.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {b.hours && String(b.hours).trim() && (
            <p className="text-xs text-neutral-300 mt-1.5 whitespace-pre-line">
              🕒 {String(b.hours).trim().slice(0, 160)}
            </p>
          )}
          {b.address && (
            <p className="text-xs text-neutral-400 mt-0.5">📍 {String(b.address).slice(0, 90)}</p>
          )}
          {b.contact && <p className="text-xs text-neutral-400 mt-0.5">📞 {b.contact}</p>}
        </div>
      </Link>

      {(menuMode || wa || canCall) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {menuMode && (
            <Link
              href={menuHref(b.id)}
              onClick={onNavigate}
              className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-full px-3.5 py-1.5"
            >
              {menuMode === "enquiry" ? t.servicesBtn : t.menuBtn}
            </Link>
          )}
          {wa && (
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(t.waGreet(b.name))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold bg-green-600 hover:bg-green-700 transition text-white rounded-full px-3.5 py-1.5"
            >
              {t.waBtn}
            </a>
          )}
          {canCall && (
            <a
              href={`tel:${digits}`}
              className="text-xs font-semibold border border-neutral-700 hover:border-orange-500 transition text-neutral-200 rounded-full px-3.5 py-1.5"
            >
              {t.callBtn}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function MenuHitRow({ h, onNavigate }) {
  return (
    <Link
      href={menuHref(h.business_id)}
      onClick={onNavigate}
      className="flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm hover:border-orange-500 transition"
    >
      <span className="text-neutral-200 min-w-0">
        🍽️ {h.name}
        <span className="text-neutral-500"> · {h.businessName}</span>
      </span>
      <span className="text-orange-400 font-semibold flex-shrink-0">{money(h.price)}</span>
    </Link>
  );
}
