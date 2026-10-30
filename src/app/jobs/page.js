// src/app/jobs/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

// `value` is what gets stored in the database (English). af/en are display labels.
const CATEGORIES = [
  { value: "Other", af: "Ander", en: "Other" },
  { value: "Domestic Work", af: "Huiswerk", en: "Domestic Work" },
  { value: "Farm Work", af: "Plaaswerk", en: "Farm Work" },
  { value: "Retail", af: "Kleinhandel", en: "Retail" },
  { value: "Trades", af: "Ambagte", en: "Trades" },
  { value: "Admin/Office", af: "Admin/Kantoor", en: "Admin/Office" },
  { value: "Hospitality", af: "Gasvryheid", en: "Hospitality" },
  { value: "Driving", af: "Bestuur", en: "Driving" },
  { value: "Security", af: "Sekuriteit", en: "Security" },
];

// Works for old rows too (which may have stored the Afrikaans label)
function categoryLabel(raw, lang) {
  const c = CATEGORIES.find((c) => c.value === raw || c.af === raw || c.en === raw);
  return c ? c[lang] : raw;
}

function waLink(number, msg) {
  let digits = (number || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  else if (!digits.startsWith("27")) digits = "27" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

function timeAgo(dateStr, lang) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const units = [
    { s: 31536000, af: "j", en: "y" },
    { s: 2592000, af: "m", en: "mo" },
    { s: 86400, af: "d", en: "d" },
    { s: 3600, af: "u", en: "h" },
    { s: 60, af: "min", en: "m" },
  ];
  for (const u of units) {
    const val = Math.floor(seconds / u.s);
    if (val >= 1) return `${val}${lang === "af" ? u.af : u.en}`;
  }
  return lang === "af" ? "nou" : "now";
}

const text = {
  af: {
    title: "Werk",
    sub: "Vind werk of plaas 'n vakature in Brandfort.",
    disclaimer: "Kontak direk via WhatsApp — Bulletin is nie betrokke by aanstellingsbesluite of ooreenkomste nie.",
    privacyNote: "Deur te plaas, stem jy in tot ons",
    privacyLink: "privaatheidsbeleid",
    tabJob: "💼 Vakatures",
    tabSeeker: "🙋 Soek Werk",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markFilledJob: "Merk as Gevul",
    markFilledSeeker: "Merk as Onbeskikbaar",
    filled: "GEVUL",
    unavailable: "ONBESKIKBAAR",
    report: "🚩 Rapporteer",
    noJobs: "Nog geen vakatures nie.",
    noSeekers: "Niemand het nog beskikbaarheid gelys nie.",
    beFirst: "Wees die eerste een!",
    confirmJob: "Merk hierdie werk as gevul?",
    confirmSeeker: "Merk jouself as nie meer beskikbaar nie?",
    whatsappMsg: (title) => `Hi, ek het jou "${title}" plasing op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Jobs",
    sub: "Find work or post a vacancy in Brandfort.",
    disclaimer: "Connect directly via WhatsApp — Bulletin isn't involved in hiring decisions or agreements.",
    privacyNote: "By posting, you agree to our",
    privacyLink: "privacy policy",
    tabJob: "💼 Job Openings",
    tabSeeker: "🙋 Looking for Work",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markFilledJob: "Mark as Filled",
    markFilledSeeker: "Mark as Unavailable",
    filled: "FILLED",
    unavailable: "UNAVAILABLE",
    report: "🚩 Report",
    noJobs: "No job openings yet.",
    noSeekers: "No one's listed availability yet.",
    beFirst: "Be the first!",
    confirmJob: "Mark this job as filled?",
    confirmSeeker: "Mark yourself as no longer available?",
    whatsappMsg: (title) => `Hi, I saw your "${title}" listing on Ons Brandfort Bulletin`,
  },
};

export default function Jobs() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("job");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState([]);

  const t = text[lang];

  useEffect(() => {
    fetchListings();
    const saved = JSON.parse(localStorage.getItem("myJobListings") || "[]");
    setMyListings(saved);
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });
    if (!error) setListings(data);
    setLoading(false);
  }

  async function markFilled(id) {
    const confirmMsg = activeTab === "job" ? t.confirmJob : t.confirmSeeker;
    if (!confirm(confirmMsg)) return;
    const { error } = await supabase.from("jobs").update({ is_filled: true }).eq("id", id);
    if (!error) fetchListings();
  }

  async function flagListing(id) {
    const flaggedKey = `flagged_job_${id}`;
    if (localStorage.getItem(flaggedKey)) return;
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const newCount = (listing.flag_count || 0) + 1;
    const { error } = await supabase
      .from("jobs")
      .update({ flag_count: newCount, is_hidden: newCount >= 3 })
      .eq("id", id);
    if (!error) {
      localStorage.setItem(flaggedKey, "true");
      fetchListings();
    }
  }

  const openCount = (type) =>
    listings.filter((l) => l.type === type && !l.is_filled).length;

  // Filled listings sink to the bottom; order otherwise stays newest-first
  const filtered = listings
    .filter((l) => l.type === activeTab)
    .sort((a, b) => Number(!!a.is_filled) - Number(!!b.is_filled));

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header
        className="border-b border-orange-900/60 px-4 pt-6 pb-6"
        style={{
          background: "radial-gradient(circle at 20% 0%, #7c2d12, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              💼 <span className="text-orange-400">{t.title}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{t.sub}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-16 flex-1 w-full">
        {/* Disclaimer */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-neutral-300 text-sm">ℹ️ {t.disclaimer}</p>
          <p className="text-neutral-500 text-xs mt-1">
            {t.privacyNote}{" "}
            <Link href="/privacy" className="underline hover:text-orange-400">
              {t.privacyLink}
            </Link>
            .
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab("job");
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === "job"
                ? "bg-orange-500 text-white"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            {t.tabJob}
            {!loading && ` (${openCount("job")})`}
          </button>
          <button
            onClick={() => {
              setActiveTab("seeker");
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === "seeker"
                ? "bg-orange-500 text-white"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            {t.tabSeeker}
            {!loading && ` (${openCount("seeker")})`}
          </button>
        </div>

        {loading && <SkeletonList Component={SkeletonPostCard} count={3} />}

        {/* Listings */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 ${
                item.is_filled ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-bold text-lg leading-tight break-words min-w-0">
                  {item.title}
                </h2>
                {item.is_filled && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex-shrink-0">
                    {activeTab === "job" ? t.filled : t.unavailable}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-300 mt-2 leading-relaxed whitespace-pre-line break-words">
                {item.description}
              </p>

              <div className="flex items-center flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-full px-2.5 py-0.5">
                  {categoryLabel(item.category, lang)}
                </span>
                <span className="text-xs text-neutral-500">
                  {t.by} {item.name} · {timeAgo(item.created_at, lang)}
                </span>
              </div>

              <div className="flex gap-3 mt-4 flex-wrap items-center">
                {!item.is_filled && (
                  <a
                    href={waLink(item.whatsapp, t.whatsappMsg(item.title))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 transition text-sm font-semibold px-4 py-2 rounded-lg"
                  >
                    {t.whatsappBtn}
                  </a>
                )}
                {myListings.includes(item.id) && !item.is_filled && (
                  <button
                    onClick={() => markFilled(item.id)}
                    className="text-sm text-neutral-400 hover:text-white border border-neutral-700 px-4 py-2 rounded-lg"
                  >
                    {activeTab === "job" ? t.markFilledJob : t.markFilledSeeker}
                  </button>
                )}
                <button
                  onClick={() => flagListing(item.id)}
                  className="text-xs text-neutral-600 hover:text-red-400 ml-auto"
                >
                  {t.report}
                </button>
              </div>
            </article>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">{activeTab === "job" ? "💼" : "🙋"}</div>
            <p className="text-neutral-400 text-sm mb-1">
              {activeTab === "job" ? t.noJobs : t.noSeekers}
            </p>
            <Link
              href={`/create/job?type=${activeTab}`}
              className="text-orange-400 text-sm font-semibold underline"
            >
              {t.beFirst}
            </Link>
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}