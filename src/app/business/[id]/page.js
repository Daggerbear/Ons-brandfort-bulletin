"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Image from "next/image";

const CATEGORY_ICONS = {
  "Agriculture": "🌾",
  "Automotive": "🚗",
  "Beauty & Spa": "💅",
  "Food & Dining": "🍽️",
  "Health & Medical": "🏥",
  "Home Services": "🏠",
  "Professional Services": "💼",
  "Retail & Shopping": "🛍️",
  "Other": "📦",
};

export default function BusinessDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [business, setBusiness] = useState(null);
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      const [businessResult, menuResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", id).single(),
        supabase
          .from("business_menu_settings")
          .select("menu_enabled")
          .eq("business_id", id)
          .maybeSingle(),
      ]);

      if (!businessResult.error) setBusiness(businessResult.data);
      setMenuEnabled(menuResult.data?.menu_enabled === true);
      setLoading(false);
    };

    if (id) {
      fetchBusiness();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("business_reviews")
      .select("*")
      .eq("business_id", id)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) return;
    setSubmittingReview(true);

    const { error } = await supabase.from("business_reviews").insert({
      business_id: id,
      name: reviewName.trim() || null,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });

    setSubmittingReview(false);

    if (!error) {
      setReviewName("");
      setReviewRating(0);
      setReviewComment("");
      fetchReviews();
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const text = {
    af: {
      back: "Terug na Tuisblad",
      address: "Adres",
      hours: "Ure",
      contact: "Kontak",
      whatsapp: "WhatsApp",
      website: "Webwerf",
      menu: "Spyskaart",
      notFound: "Besigheid nie gevind nie.",
      reviews: "Resensies",
      noReviews: "Nog geen resensies nie.",
      yourName: "Jou naam (opsioneel)",
      yourComment: "Skryf 'n resensie...",
      submit: "Plaas Resensie",
      submitting: "Stuur...",
    },
    en: {
      back: "Back to Homepage",
      address: "Address",
      hours: "Hours",
      contact: "Contact",
      whatsapp: "WhatsApp",
      website: "Website",
      menu: "Menu",
      notFound: "Business not found.",
      reviews: "Reviews",
      noReviews: "No reviews yet.",
      yourName: "Your name (optional)",
      yourComment: "Write a review...",
      submit: "Post Review",
      submitting: "Posting...",
    },
  };

  const t = text[lang];

  const getWhatsappLink = (contact) => {
    if (!contact) return null;
    const match = contact.match(/0\d[\d\s]{7,}/);
    if (!match) return null;
    let digits = match[0].replace(/\D/g, "");
    if (digits.length < 9) return null;
    digits = "27" + digits.slice(1);

    const message =
      lang === "af"
        ? "Hi, ek het jou op Ons Brandfort Bulletin gekry! Ek wil navrae doen oor "
        : "Hi, I found you on Ons Brandfort Bulletin! I'd like to enquire about ";

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  const getWebsiteLink = (website) => {
    if (!website) return null;
    if (website.startsWith("http://") || website.startsWith("https://")) {
      return website;
    }
    return `https://${website}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <p className="text-neutral-400 text-center mt-20">Loading...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <div className="max-w-md mx-auto mt-20 text-center">
          <p className="text-neutral-400 mb-6">{t.notFound}</p>
          <a
            href="/"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            {t.back}
          </a>
        </div>
      </main>
    );
  }

  const whatsappLink = getWhatsappLink(business.contact);
  const websiteLink = getWebsiteLink(business.website);
  const categoryIcon = CATEGORY_ICONS[business.category] || "🏪";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      {/* Hero header */}
      <div className="bg-gradient-to-b from-orange-500/20 via-neutral-950 to-neutral-950 border-b border-neutral-800 px-6 pt-6 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={`${business.name} logo`}
                width={88}
                height={88}
                className="w-[88px] h-[88px] object-cover rounded-2xl border-2 border-orange-500/40 flex-shrink-0"
              />
            ) : (
              <div className="w-[88px] h-[88px] rounded-2xl border-2 border-orange-500/40 bg-neutral-900 flex items-center justify-center text-4xl flex-shrink-0">
                {categoryIcon}
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-orange-400 border border-orange-500/40 rounded-full px-3 py-1 mb-2">
                {categoryIcon} {business.category}
              </span>
              <h1 className="text-2xl font-bold leading-tight">{business.name}</h1>
              {averageRating && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </span>
                  <span className="text-neutral-400 text-xs">
                    {averageRating} ({reviews.length})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Action bar */}
        <div className="flex flex-col gap-3 mb-8">
          {menuEnabled && (
            <a
              href={`/business/${business.id}/menu`}
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3"
            >
              📋 {t.menu}
            </a>
          )}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg px-4 py-3"
            >
              💬 {t.whatsapp}
            </a>
          )}
          {websiteLink && (
            <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition text-white font-semibold rounded-lg px-4 py-3"
            >
              🌐 {t.website}
            </a>
          )}
        </div>

        <p className="text-neutral-300 mb-6 leading-relaxed">
          {business.description}
        </p>

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {business.address && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 col-span-2">
              <p className="text-xs text-neutral-500 uppercase mb-1">📍 {t.address}</p>
              <p className="text-white text-sm">{business.address}</p>
            </div>
          )}
          {business.hours && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs text-neutral-500 uppercase mb-1">🕒 {t.hours}</p>
              <p className="text-white text-sm">{business.hours}</p>
            </div>
          )}
          {business.contact && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs text-neutral-500 uppercase mb-1">📞 {t.contact}</p>
              <p className="text-white text-sm">{business.contact}</p>
            </div>
          )}
        </div>

        {/* Reviews — visually separated */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-4">⭐ {t.reviews}</h2>

          <div className="flex flex-col gap-2 mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl ${
                    star <= reviewRating ? "text-yellow-400" : "text-neutral-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder={t.yourName}
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <textarea
              placeholder={t.yourComment}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={2}
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleReviewSubmit}
              disabled={reviewRating === 0 || submittingReview}
              className="self-end bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {submittingReview ? t.submitting : t.submit}
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
                  {r.name && (
                    <span className="text-sm text-neutral-400">{r.name}</span>
                  )}
                </div>
                {r.comment && (
                  <p className="text-neutral-300 text-sm">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <a
          href="/"
          className="block text-center text-neutral-400 hover:text-white underline mt-8"
        >
          {t.back}
        </a>
      </div>
    </main>
  );
}