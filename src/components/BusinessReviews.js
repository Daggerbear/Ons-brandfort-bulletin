"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const text = {
  af: {
    reviews: "Resensies",
    noReviews: "Nog geen resensies nie. Wees die eerste!",
    yourName: "Jou naam (opsioneel)",
    yourComment: "Skryf 'n resensie...",
    submit: "Plaas Resensie",
    submitting: "Stuur...",
    pickRating: "Tik op 'n ster om te gradeer.",
    error: "Kon nie jou resensie plaas nie. Probeer asseblief weer.",
  },
  en: {
    reviews: "Reviews",
    noReviews: "No reviews yet. Be the first!",
    yourName: "Your name (optional)",
    yourComment: "Write a review...",
    submit: "Post Review",
    submitting: "Posting...",
    pickRating: "Tap a star to rate.",
    error: "Couldn't post your review. Please try again.",
  },
};

export default function BusinessReviews({ businessId, reviews, lang, onPosted }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const t = text[lang];

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    setErrorMsg("");

    const { error } = await supabase.from("business_reviews").insert({
      business_id: businessId,
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
    onPosted();
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">⭐ {t.reviews}</h2>
        {average && (
          <div className="text-right">
            <p className="text-2xl font-black text-orange-400 leading-none">{average}</p>
            <p className="text-yellow-400 text-xs mt-0.5">
              {"★".repeat(Math.round(average))}
              {"☆".repeat(5 - Math.round(average))}{" "}
              <span className="text-neutral-500">({reviews.length})</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? "text-yellow-400" : "text-neutral-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating === 0 && (
          <p className="text-xs text-neutral-500">{t.pickRating}</p>
        )}
        <input
          type="text"
          placeholder={t.yourName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
        />
        <textarea
          placeholder={t.yourComment}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          maxLength={500}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
        />

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-3 py-2">
            ⚠️ {errorMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="self-end bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {submitting ? t.submitting : t.submit}
        </button>
      </div>

      {reviews.length === 0 && (
        <p className="text-neutral-500 text-sm">{t.noReviews}</p>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-neutral-800 pb-3 last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-400 text-sm">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
              {r.name && <span className="text-sm text-neutral-400">{r.name}</span>}
            </div>
            {r.comment && (
              <p className="text-neutral-300 text-sm whitespace-pre-line break-words">
                {r.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}