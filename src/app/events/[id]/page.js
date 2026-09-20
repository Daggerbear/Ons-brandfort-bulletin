// src/app/events/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const MONTHS = {
  af: ["Januarie", "Februarie", "Maart", "April", "Mei", "Junie", "Julie", "Augustus", "September", "Oktober", "November", "Desember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const WEEKDAYS = {
  af: ["Sondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

// Handles both "2026-10-17" and "17-10-2026"
function parseDate(str) {
  if (!str) return null;
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let d = null;
  if (m) d = new Date(+m[1], +m[2] - 1, +m[3]);
  else {
    m = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) d = new Date(+m[3], +m[2] - 1, +m[1]);
  }
  return d && !isNaN(d.getTime()) ? d : null;
}

function formatDate(str, lang) {
  const d = parseDate(str);
  if (!d) return str || "";
  return `${WEEKDAYS[lang][d.getDay()]} ${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`;
}

function daysUntil(str) {
  const d = parseDate(str);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function waLink(number, msg) {
  let digits = (number || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  else if (!digits.startsWith("27")) digits = "27" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

const text = {
  af: {
    back: "← Terug na Gemeenskap",
    notFound: "Gebeurtenis nie gevind nie.",
    notFoundSub: "Dit is dalk verwyder of die skakel is verkeerd.",
    seeEvents: "Sien Gebeurtenisse",
    organiser: "Georganiseer deur",
    contact: "💬 WhatsApp die Organiseerder",
    share: "📲 Deel met Vriende",
    map: "Maak oop in Maps",
    today: "Vandag!",
    tomorrow: "Môre",
    inDays: (n) => `Oor ${n} dae`,
    past: "Reeds verby",
    contactMsg: (title) => `Ek kontak jou aangaande "${title}"`,
    shareMsg: (e, dateStr, url) =>
      `📅 ${e.title}\n${dateStr}${e.time ? ` • ${e.time}` : ""}\n📍 ${e.location}\n\n${url}`,
  },
  en: {
    back: "← Back to Community",
    notFound: "Event not found.",
    notFoundSub: "It may have been removed, or the link is wrong.",
    seeEvents: "See Events",
    organiser: "Organised by",
    contact: "💬 WhatsApp the Organiser",
    share: "📲 Share with Friends",
    map: "Open in Maps",
    today: "Today!",
    tomorrow: "Tomorrow",
    inDays: (n) => `In ${n} days`,
    past: "Past event",
    contactMsg: (title) => `I'm contacting you about "${title}"`,
    shareMsg: (e, dateStr, url) =>
      `📅 ${e.title}\n${dateStr}${e.time ? ` • ${e.time}` : ""}\n📍 ${e.location}\n\n${url}`,
  },
};

export default function EventDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = text[lang];

  useEffect(() => {
    const loadEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setEvent(data);
      setLoading(false);
    };
    loadEvent();
  }, [id]);

  function handleShare() {
    const url = `${window.location.origin}/events/${id}`;
    const msg = t.shareMsg(event, formatDate(event.date, lang), url);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const days = event ? daysUntil(event.date) : null;
  let countdown = null;
  if (days !== null) {
    if (days < 0) countdown = { label: t.past, past: true };
    else if (days === 0) countdown = { label: t.today };
    else if (days === 1) countdown = { label: t.tomorrow };
    else countdown = { label: t.inDays(days) };
  }

  const header = (
    <div className="flex justify-between items-center mb-4">
      <Link href="/community" className="text-sm text-green-400 hover:text-green-300">
        {t.back}
      </Link>
      <button
        onClick={() => setLang(lang === "af" ? "en" : "af")}
        className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-green-400 hover:text-green-400 transition"
      >
        {lang === "af" ? "English" : "Afrikaans"}
      </button>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Nav lang={lang} />
        <section className="px-6 py-8 max-w-2xl mx-auto w-full flex-1">
          {header}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-72 bg-neutral-800" />
            <div className="p-6 space-y-3">
              <div className="h-7 w-2/3 bg-neutral-800 rounded" />
              <div className="h-4 w-1/2 bg-neutral-800 rounded" />
              <div className="h-4 w-1/3 bg-neutral-800 rounded" />
              <div className="h-20 bg-neutral-800 rounded" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Nav lang={lang} />
        <section className="px-6 py-8 max-w-2xl mx-auto w-full flex-1">
          {header}
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-neutral-300 font-semibold">{t.notFound}</p>
            <p className="text-neutral-500 text-sm mt-1 mb-6">{t.notFoundSub}</p>
            <Link
              href="/community"
              className="inline-block bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-xl px-5 py-3 text-sm"
            >
              {t.seeEvents}
            </Link>
          </div>
        </section>
        <Footer lang={lang} />
      </main>
    );
  }

  const mapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.location}, Free State, South Africa`
      )}`
    : null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <section className="px-6 py-8 max-w-2xl mx-auto w-full flex-1">
        {header}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {event.image_url && (
            <div className="relative w-full h-[60vh] min-h-[280px] max-h-[520px] bg-black">
              <SafeImage
                src={event.image_url}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 700px"
                className="object-contain"
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-7xl bg-gradient-to-br from-green-950 to-neutral-900">
                    📅
                  </div>
                }
              />
            </div>
          )}

          <div className="p-6">
            {countdown && (
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1 mb-3 ${
                  countdown.past
                    ? "bg-neutral-800 text-neutral-400"
                    : "bg-green-400 text-black"
                }`}
              >
                {countdown.label}
              </span>
            )}

            <h1 className="text-2xl font-black leading-tight break-words">
              {event.title}
            </h1>

            {/* Facts */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-semibold">{formatDate(event.date, lang)}</p>
                  {event.time && <p className="text-xs text-neutral-400">🕐 {event.time}</p>}
                </div>
              </div>

              {event.location && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-neutral-950 border border-neutral-800 hover:border-green-500 transition rounded-xl px-4 py-3"
                >
                  <span className="text-xl">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold break-words">{event.location}</p>
                    <p className="text-xs text-green-400">{t.map} →</p>
                  </div>
                </a>
              )}
            </div>

            <p className="text-neutral-300 mt-5 leading-relaxed whitespace-pre-line break-words">
              {event.description}
            </p>

            {event.submittedBy && (
              <p className="text-sm text-neutral-500 mt-4">
                {t.organiser} {event.submittedBy}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {event.whatsapp && (
                <a
                  href={waLink(event.whatsapp, t.contactMsg(event.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-lg px-5 py-3 w-full"
                >
                  {t.contact}
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition font-semibold rounded-lg px-5 py-3 w-full"
              >
                {t.share}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </main>
  );
}