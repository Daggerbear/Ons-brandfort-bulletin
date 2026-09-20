// src/components/SiteReviews.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AVATAR_COLORS = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-pink-500",
  "bg-purple-500", "bg-amber-500", "bg-teal-500", "bg-red-500",
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
    title: "Wat Sê Brandfort",
    sub: "Regte mense. Eerlike woorde.",
    reviewsWord: "resensies",
    write: "✍️ Skryf 'n Resensie",
    cancel: "Kanselleer",
    yourName: "Jou naam (opsioneel)",
    yourComment: "Wat dink jy van die Bulletin? (opsioneel)",
    submit: "Plaas Resensie",
    submitting: "Stuur...",
    pickRating: "Tik op 'n ster om te gradeer.",
    ratingLabels: ["Swak", "Onder gemiddeld", "Goed", "Baie goed", "Uitstekend"],
    thanks: "Dankie vir jou resensie! 🧡",
    error: "Kon nie jou resensie plaas nie. Probeer asseblief weer.",
    empty: "Nog geen resensies nie. Wees die eerste!",
    anonymous: "Anoniem",
    showMore: (n) => `Wys ${n} meer`,
    showLess: "Wys minder",
  },
  en: {
    title: "What Brandfort Says",
    sub: "Real people. Honest words.",
    reviewsWord: "reviews",
    write: "✍️ Write a Review",
    cancel: "Cancel",
    yourName: "Your name (optional)",
    yourComment: "What do you think of the Bulletin? (optional)",
    submit: "Post Review",
    submitting: "Posting...",
    pickRating: "Tap a star to rate.",
    ratingLabels: ["Poor", "Fair", "Good", "Very good", "Excellent"],
    thanks: "Thanks for your review! 🧡",
    error: "Couldn't post your review. Please try again.",
    empty: "No reviews yet. Be the first!",
    anonymous: "Anonymous",
    showMore: (n) => `Show ${n} more`,
    showLess: "Show less",
  },
};

const INITIAL_SHOWN = 4;

export default function SiteReviews({ lang }) {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [thanks, setThanks] = useState(false);

  const t = text[lang];

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("site_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoaded(true);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setErrorMsg("");

    const { error } = await supabase.from("site_reviews").insert({
      name: name.trim() || null,
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      console.log("Review error:", error);
      setErrorMsg(t.error);
      return;
    }

    setName("");
    setRating(0);
    setComment("");
    setShowForm(false);
    setThanks(true);
    setTimeout(() => setThanks(false), 4000);
    fetchReviews();
  };

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (counts[r.rating] !== undefined) counts[r.rating] += 1;
  });

  const visible = showAll ? reviews : reviews.slice(0, INITIAL_SHOWN);
  const hiddenCount = reviews.length - INITIAL_SHOWN;

  return (
    <section className="px-6 py-12 max-w-2xl mx-auto border-t border-neutral-800">
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight">{t.title}</h2>
        <p className="text-sm text-neutral-500 mt-1">{t.sub}</p>
      </div>

      {/* Summary */}
      {average && (
        <div
          className="flex items-center gap-5 bg-neutral-900 border border-orange-500/30 rounded-2xl p-5 mb-5"
          style={{ boxShadow: "0 0 24px rgba(249,115,22,0.08)" }}
        >
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-black text-orange-500 leading-none tabular-nums">
              {average}
            </p>
            <p className="text-yellow-400 text-sm mt-2">
              {"★".repeat(Math.round(average))}
              {"☆".repeat(5 - Math.round(average))}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {reviews.length} {t.reviewsWord}
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = reviews.length ? (counts[star] / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-2 text-right">{star}</span>
                  <span className="text-yellow-400">★</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-right tabular-nums">{counts[star]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write button / thanks */}
      {thanks && (
        <div className="bg-green-950/60 border border-green-500/40 text-green-300 text-sm rounded-xl px-4 py-3 mb-4 text-center">
          {t.thanks}
        </div>
      )}

      <button
        onClick={() => {
          setShowForm(!showForm);
          setErrorMsg("");
        }}
        className={`w-full transition rounded-xl py-3 font-semibold mb-5 ${
          showForm
            ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
      >
        {showForm ? t.cancel : t.write}
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-5 mb-6 space-y-3">
          <div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition hover:scale-110 ${
                    star <= rating ? "text-yellow-400" : "text-neutral-700"
                  }`}
                  aria-label={`${star}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-xs mt-1 h-4 text-neutral-500">
              {rating > 0 ? (
                <span className="text-orange-400 font-semibold">
                  {t.ratingLabels[rating - 1]}
                </span>
              ) : (
                t.pickRating
              )}
            </p>
          </div>

          <input
            type="text"
            placeholder={t.yourName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
          />
          <textarea
            placeholder={t.yourComment}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
          />

          {errorMsg && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-3 py-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      )}

      {/* Reviews */}
      {loaded && reviews.length === 0 && (
        <p className="text-neutral-500 text-sm text-center py-6">{t.empty}</p>
      )}

      <div className="grid gap-3">
        {visible.map((r) => {
          const displayName = r.name || t.anonymous;
          return (
            <div
              key={r.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0 ${
                    r.name ? avatarColor(r.name) : "bg-neutral-700 text-white"
                  }`}
                >
                  {r.name ? r.name.charAt(0).toUpperCase() : "👤"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{displayName}</p>
                  <p className="text-yellow-400 text-xs">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                </div>
                <span className="text-xs text-neutral-600 flex-shrink-0">
                  {timeAgo(r.created_at, lang)}
                </span>
              </div>
              {r.comment && (
                <p className="text-neutral-300 text-sm leading-relaxed mt-3 whitespace-pre-line break-words">
                  {r.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > INITIAL_SHOWN && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-sm text-orange-400 hover:text-orange-300 mt-4 py-2"
        >
          {showAll ? t.showLess : t.showMore(hiddenCount)}
        </button>
      )}
    </section>
  );
}