// src/app/classifieds/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

// `value` is what gets stored in the database (English). af/en are display labels.
const CATEGORIES = [
  { value: "Other", af: "Ander", en: "Other", icon: "📦" },
  { value: "Vehicles", af: "Voertuie", en: "Vehicles", icon: "🚗" },
  { value: "Furniture", af: "Meubels", en: "Furniture", icon: "🛋️" },
  { value: "Electronics", af: "Elektronika", en: "Electronics", icon: "📱" },
  { value: "Clothing", af: "Klere", en: "Clothing", icon: "👕" },
  { value: "Household", af: "Huishoudelik", en: "Household", icon: "🏠" },
  { value: "Tools", af: "Gereedskap", en: "Tools", icon: "🔧" },
  { value: "Livestock", af: "Vee", en: "Livestock", icon: "🐄" },
];

// Works for old rows too (which may have stored the Afrikaans label)
function findCategory(raw) {
  return CATEGORIES.find((c) => c.value === raw || c.af === raw || c.en === raw) || null;
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

// Resize to max 1400px wide and save as a light JPEG.
// Falls back to the original file if anything goes wrong or it wouldn't get smaller.
async function compressPhoto(file, maxWidth = 1400, quality = 0.8) {
  try {
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

const text = {
  af: {
    title: "Koop & Verkoop",
    sub: "Plaaslike classifieds vir Brandfort.",
    disclaimer: "Koop en verkoop plaaslik. Alle transaksies gebeur direk tussen jou en die koper/verkoper via WhatsApp — Bulletin is nie deel van enige transaksie nie.",
    privacyNote: "Deur te plaas, stem jy in tot ons",
    privacyLink: "privaatheidsbeleid",
    postBtn: "+ Plaas 'n Item",
    cancel: "Kanselleer",
    name: "Jou naam",
    whatsapp: "WhatsApp nommer (bv. 0821234567)",
    itemTitle: "Wat verkoop jy?",
    description: "Beskrywing...",
    priceOnRequest: "Prys op aanvraag",
    price: "Prys (R)",
    addPhoto: "Voeg 'n foto by (opsioneel)",
    changePhoto: "Verander foto",
    removePhoto: "Verwyder",
    posting: "Plaas tans...",
    postListing: "Plaas Item",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markSold: "Merk as Verkoop",
    sold: "VERKOOP",
    report: "🚩 Rapporteer",
    all: "Alles",
    noListings: "Nog geen items nie.",
    noListingsFilter: "Geen items in hierdie kategorie nie.",
    beFirst: "Wees die eerste een!",
    confirmSold: "Merk hierdie item as verkoop?",
    errorPhoto: "Kon nie die foto oplaai nie. Probeer 'n ander foto, of verwyder dit en probeer weer.",
    errorPost: "Kon nie jou item plaas nie. Probeer asseblief weer.",
    whatsappMsg: (title) => `Hi, ek het jou item "${title}" op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Classifieds",
    sub: "Local buy & sell for Brandfort.",
    disclaimer: "Buy & sell locally. All deals happen directly between you and the buyer/seller via WhatsApp — Bulletin isn't involved in any transaction.",
    privacyNote: "By posting, you agree to our",
    privacyLink: "privacy policy",
    postBtn: "+ Post a Listing",
    cancel: "Cancel",
    name: "Your name",
    whatsapp: "WhatsApp number (e.g. 0821234567)",
    itemTitle: "What are you selling?",
    description: "Description...",
    priceOnRequest: "Price on request",
    price: "Price (R)",
    addPhoto: "Add a photo (optional)",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    posting: "Posting...",
    postListing: "Post Listing",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markSold: "Mark as Sold",
    sold: "SOLD",
    report: "🚩 Report",
    all: "All",
    noListings: "No listings yet.",
    noListingsFilter: "No listings in this category.",
    beFirst: "Be the first!",
    confirmSold: "Mark this listing as sold?",
    errorPhoto: "Couldn't upload the photo. Try a different photo, or remove it and try again.",
    errorPost: "Couldn't post your listing. Please try again.",
    whatsappMsg: (title) => `Hi, I saw your listing "${title}" on Ons Brandfort Bulletin`,
  },
};

export default function Classifieds() {
  const [lang, setLang] = useState("af");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [filter, setFilter] = useState("all");

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [category, setCategory] = useState("Other");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const t = text[lang];

  useEffect(() => {
    fetchListings();
    const saved = JSON.parse(localStorage.getItem("myClassifieds") || "[]");
    setMyListings(saved);
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("classifieds")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });
    if (!error) setListings(data);
    setLoading(false);
  }

  function handlePhotoChange(e) {
    const picked = e.target.files[0];
    if (!picked) return;
    setImage(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function removePhoto() {
    setImage(null);
    setPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    setErrorMsg("");

    let image_url = null;
    if (image) {
      const uploadFile = await compressPhoto(image);
      const compressed = uploadFile !== image;
      const fileExt = compressed ? "jpg" : image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("classifieds")
        .upload(
          fileName,
          uploadFile,
          compressed ? { contentType: "image/jpeg" } : undefined
        );

      if (uploadError) {
        console.log("Upload error:", uploadError);
        setErrorMsg(t.errorPhoto);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("classifieds")
        .getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("classifieds")
      .insert({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        title: title.trim(),
        description: description.trim(),
        price: priceOnRequest ? null : price ? parseFloat(price) : null,
        price_on_request: priceOnRequest,
        category,
        image_url,
      })
      .select()
      .single();

    setSubmitting(false);

    if (!error && data) {
      const updated = [...myListings, data.id];
      localStorage.setItem("myClassifieds", JSON.stringify(updated));
      setMyListings(updated);
      setShowForm(false);
      setName("");
      setWhatsapp("");
      setTitle("");
      setDescription("");
      setPrice("");
      setPriceOnRequest(false);
      setCategory("Other");
      setImage(null);
      setPreview(null);
      fetchListings();
    } else {
      console.log("Error posting listing:", error);
      setErrorMsg(t.errorPost);
    }
  }

  async function markSold(id) {
    if (!confirm(t.confirmSold)) return;
    const { error } = await supabase.from("classifieds").update({ is_sold: true }).eq("id", id);
    if (!error) fetchListings();
  }

  async function flagListing(id) {
    const flaggedKey = `flagged_classified_${id}`;
    if (localStorage.getItem(flaggedKey)) return;
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const newCount = (listing.flag_count || 0) + 1;
    const { error } = await supabase
      .from("classifieds")
      .update({ flag_count: newCount, is_hidden: newCount >= 3 })
      .eq("id", id);
    if (!error) {
      localStorage.setItem(flaggedKey, "true");
      fetchListings();
    }
  }

  function priceText(item) {
    if (item.price_on_request) return t.priceOnRequest;
    if (item.price) return `R${Number(item.price).toLocaleString("en-ZA")}`;
    return null;
  }

  // Only show filter pills for categories that actually have listings
  const presentValues = new Set(
    listings.map((l) => findCategory(l.category)?.value).filter(Boolean)
  );
  const filterCats = CATEGORIES.filter((c) => presentValues.has(c.value));

  // Sold items sink to the bottom; order otherwise stays newest-first
  const visible = listings
    .filter((l) => filter === "all" || findCategory(l.category)?.value === filter)
    .sort((a, b) => Number(!!a.is_sold) - Number(!!b.is_sold));

  const inputClass =
    "w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-green-500";

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <header
        className="border-b border-green-900/60 px-4 pt-6 pb-6"
        style={{
          background: "radial-gradient(circle at 20% 0%, #14532d, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              🛒 <span className="text-green-400">{t.title}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{t.sub}</p>
          </div>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-green-400 hover:text-green-400 transition flex-shrink-0"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-16 flex-1 w-full">
        {/* Disclaimer */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-neutral-300 text-sm">ℹ️ {t.disclaimer}</p>
          <p className="text-neutral-500 text-xs mt-1">
            {t.privacyNote}{" "}
            <Link href="/privacy" className="underline hover:text-green-400">
              {t.privacyLink}
            </Link>
            .
          </p>
        </div>

        {/* Post button */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrorMsg("");
          }}
          className={`w-full transition rounded-xl py-3 font-semibold mb-5 ${
            showForm
              ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              : "bg-green-500 hover:bg-green-600 text-black"
          }`}
        >
          {showForm ? t.cancel : t.postBtn}
        </button>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 border border-green-500/30 rounded-2xl p-5 mb-6 space-y-3"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name}
              maxLength={40}
              required
              className={inputClass}
            />
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t.whatsapp}
              maxLength={20}
              required
              className={inputClass}
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.itemTitle}
              maxLength={80}
              required
              className={inputClass}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.description}
              rows={3}
              maxLength={600}
              required
              className={inputClass}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c[lang]}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <input
                type="checkbox"
                checked={priceOnRequest}
                onChange={(e) => setPriceOnRequest(e.target.checked)}
              />
              {t.priceOnRequest}
            </label>

            {!priceOnRequest && (
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t.price}
                className={inputClass}
              />
            )}

            <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 hover:border-green-500 transition rounded-lg px-4 py-3 cursor-pointer">
              📷 {image ? t.changePhoto : t.addPhoto}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {preview && (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Photo preview"
                  className="w-32 h-32 object-cover rounded-lg border border-neutral-800"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label={t.removePhoto}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-200 hover:text-red-400 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-black transition rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? t.posting : t.postListing}
            </button>
          </form>
        )}

        {/* Category filters */}
        {!loading && filterCats.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                filter === "all"
                  ? "bg-green-500 border-green-500 text-black font-semibold"
                  : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
              }`}
            >
              {t.all}
            </button>
            {filterCats.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilter(c.value)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                  filter === c.value
                    ? "bg-green-500 border-green-500 text-black font-semibold"
                    : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                {c.icon} {c[lang]}
              </button>
            ))}
          </div>
        )}

        {loading && <SkeletonList Component={SkeletonPostCard} count={3} />}

        {/* Listings */}
        <div className="space-y-4">
          {visible.map((item) => {
            const cat = findCategory(item.category);
            const priceStr = priceText(item);
            return (
              <article
                key={item.id}
                className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 ${
                  item.is_sold ? "opacity-50" : ""
                }`}
              >
                {item.image_url && (
                  <div className="relative w-full h-56 mb-3 rounded-xl overflow-hidden bg-neutral-950">
                    <SafeImage
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 600px"
                      className="object-cover"
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          {cat?.icon || "📦"}
                        </div>
                      }
                    />
                  </div>
                )}

                <div className="flex justify-between items-start gap-3">
                  <h2 className="font-bold text-lg leading-tight break-words min-w-0">
                    {item.title}
                  </h2>
                  {item.is_sold ? (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex-shrink-0">
                      {t.sold}
                    </span>
                  ) : (
                    priceStr && (
                      <span className="text-green-400 font-black text-lg flex-shrink-0 whitespace-nowrap">
                        {priceStr}
                      </span>
                    )
                  )}
                </div>

                <p className="text-sm text-neutral-300 mt-2 leading-relaxed whitespace-pre-line break-words">
                  {item.description}
                </p>

                <div className="flex items-center flex-wrap gap-2 mt-3">
                  <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-2.5 py-0.5">
                    {cat ? `${cat.icon} ${cat[lang]}` : item.category}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t.by} {item.name} · {timeAgo(item.created_at, lang)}
                  </span>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap items-center">
                  {!item.is_sold && (
                    <a
                      href={waLink(item.whatsapp, t.whatsappMsg(item.title))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 transition text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      {t.whatsappBtn}
                    </a>
                  )}
                  {myListings.includes(item.id) && !item.is_sold && (
                    <button
                      onClick={() => markSold(item.id)}
                      className="text-sm text-neutral-400 hover:text-white border border-neutral-700 px-4 py-2 rounded-lg"
                    >
                      {t.markSold}
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
            );
          })}
        </div>

        {!loading && visible.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-neutral-400 text-sm mb-1">
              {listings.length === 0 ? t.noListings : t.noListingsFilter}
            </p>
            {listings.length === 0 && (
              <p className="text-neutral-500 text-sm">{t.beFirst}</p>
            )}
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}