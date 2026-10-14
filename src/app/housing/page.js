// src/app/housing/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

// `value` is what gets stored in the database (English). af/en are display labels.
const LISTING_TYPES = [
  { value: "rent", af: "Te Huur", en: "To Rent", icon: "🔑" },
  { value: "sale", af: "Te Koop", en: "For Sale", icon: "🏷️" },
];

const PROPERTY_TYPES = [
  { value: "House", af: "Huis", en: "House", icon: "🏠" },
  { value: "Flat", af: "Woonstel", en: "Flat / Apartment", icon: "🏢" },
  { value: "Room", af: "Kamer", en: "Room", icon: "🛏️" },
  { value: "Granny flat", af: "Buitekamer", en: "Granny flat / Cottage", icon: "🏡" },
  { value: "Plot", af: "Erf / Plot", en: "Plot / Land", icon: "🌾" },
  { value: "Commercial", af: "Kommersieel", en: "Commercial", icon: "🏪" },
  { value: "Other", af: "Ander", en: "Other", icon: "📦" },
];

function findListingType(raw) {
  return LISTING_TYPES.find((c) => c.value === raw) || null;
}

function findPropertyType(raw) {
  return PROPERTY_TYPES.find((c) => c.value === raw || c.af === raw || c.en === raw) || null;
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
    title: "Behuising",
    sub: "Huise, woonstelle en kamers in Brandfort.",
    disclaimer:
      "Alle reëlings gebeur direk tussen jou en die eienaar via WhatsApp — Bulletin is nie deel van enige huur- of koopooreenkoms nie. Besigtig altyd eers voordat jy betaal.",
    privacyNote: "Deur te plaas, stem jy in tot ons",
    privacyLink: "privaatheidsbeleid",
    postBtn: "+ Plaas 'n Eiendom",
    cancel: "Kanselleer",
    name: "Jou naam",
    whatsapp: "WhatsApp nommer (bv. 0821234567)",
    listingTitle: "Titel (bv. 2-slaapkamer huis)",
    description: "Beskrywing (reëls, beskikbaarheid, borg...)",
    area: "Area / voorstad (bv. Majwemasweu)",
    bedrooms: "Slaapkamers",
    bathrooms: "Badkamers",
    anyOption: "—",
    priceOnRequest: "Prys op aanvraag",
    priceRent: "Huur per maand (R)",
    priceSale: "Verkoopprys (R)",
    perMonth: "/maand",
    addPhoto: "Voeg 'n foto by (opsioneel)",
    changePhoto: "Verander foto",
    removePhoto: "Verwyder",
    posting: "Plaas tans...",
    postListing: "Plaas Eiendom",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markRented: "Merk as Verhuur",
    markSold: "Merk as Verkoop",
    rented: "VERHUUR",
    sold: "VERKOOP",
    report: "🚩 Rapporteer",
    all: "Alles",
    allTypes: "Alle tipes",
    noListings: "Nog geen eiendomme nie.",
    noListingsFilter: "Geen eiendomme pas by hierdie filter nie.",
    beFirst: "Wees die eerste een!",
    confirmRented: "Merk hierdie eiendom as verhuur?",
    confirmSold: "Merk hierdie eiendom as verkoop?",
    errorPhoto: "Kon nie die foto oplaai nie. Probeer 'n ander foto, of verwyder dit en probeer weer.",
    errorPost: "Kon nie jou eiendom plaas nie. Probeer asseblief weer.",
    bedShort: "slaapkamer(s)",
    bathShort: "badkamer(s)",
    whatsappMsg: (title) => `Hi, ek het jou eiendom "${title}" op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Housing",
    sub: "Houses, flats and rooms in Brandfort.",
    disclaimer:
      "All arrangements happen directly between you and the owner via WhatsApp — Bulletin isn't part of any rental or sale agreement. Always view the place before you pay anything.",
    privacyNote: "By posting, you agree to our",
    privacyLink: "privacy policy",
    postBtn: "+ Post a Property",
    cancel: "Cancel",
    name: "Your name",
    whatsapp: "WhatsApp number (e.g. 0821234567)",
    listingTitle: "Title (e.g. 2-bedroom house)",
    description: "Description (rules, availability, deposit...)",
    area: "Area / suburb (e.g. Majwemasweu)",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    anyOption: "—",
    priceOnRequest: "Price on request",
    priceRent: "Rent per month (R)",
    priceSale: "Asking price (R)",
    perMonth: "/month",
    addPhoto: "Add a photo (optional)",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    posting: "Posting...",
    postListing: "Post Property",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markRented: "Mark as Rented",
    markSold: "Mark as Sold",
    rented: "RENTED",
    sold: "SOLD",
    report: "🚩 Report",
    all: "All",
    allTypes: "All types",
    noListings: "No properties yet.",
    noListingsFilter: "No properties match this filter.",
    beFirst: "Be the first!",
    confirmRented: "Mark this property as rented?",
    confirmSold: "Mark this property as sold?",
    errorPhoto: "Couldn't upload the photo. Try a different photo, or remove it and try again.",
    errorPost: "Couldn't post your property. Please try again.",
    bedShort: "bed",
    bathShort: "bath",
    whatsappMsg: (title) => `Hi, I saw your property "${title}" on Ons Brandfort Bulletin`,
  },
};

export default function Housing() {
  const [lang, setLang] = useState("af");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [propFilter, setPropFilter] = useState("all");

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState("rent");
  const [propertyType, setPropertyType] = useState("House");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [price, setPrice] = useState("");
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const t = text[lang];

  useEffect(() => {
    fetchListings();
    const saved = JSON.parse(localStorage.getItem("myHousing") || "[]");
    setMyListings(saved);
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("housing")
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
        .from("housing")
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
        .from("housing")
        .getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("housing")
      .insert({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        title: title.trim(),
        description: description.trim(),
        listing_type: listingType,
        property_type: propertyType,
        area: area.trim() || null,
        bedrooms: bedrooms === "" ? null : parseInt(bedrooms, 10),
        bathrooms: bathrooms === "" ? null : parseInt(bathrooms, 10),
        price: priceOnRequest ? null : price ? parseFloat(price) : null,
        price_on_request: priceOnRequest,
        image_url,
      })
      .select()
      .single();

    setSubmitting(false);

    if (!error && data) {
      const updated = [...myListings, data.id];
      localStorage.setItem("myHousing", JSON.stringify(updated));
      setMyListings(updated);
      setShowForm(false);
      setName("");
      setWhatsapp("");
      setTitle("");
      setDescription("");
      setListingType("rent");
      setPropertyType("House");
      setArea("");
      setBedrooms("");
      setBathrooms("");
      setPrice("");
      setPriceOnRequest(false);
      setImage(null);
      setPreview(null);
      fetchListings();
    } else {
      console.log("Error posting property:", error);
      setErrorMsg(t.errorPost);
    }
  }

  async function markTaken(item) {
    const msg = item.listing_type === "sale" ? t.confirmSold : t.confirmRented;
    if (!confirm(msg)) return;
    const { error } = await supabase.from("housing").update({ is_taken: true }).eq("id", item.id);
    if (!error) fetchListings();
  }

  async function flagListing(id) {
    const flaggedKey = `flagged_housing_${id}`;
    if (localStorage.getItem(flaggedKey)) return;
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const newCount = (listing.flag_count || 0) + 1;
    const { error } = await supabase
      .from("housing")
      .update({ flag_count: newCount, is_hidden: newCount >= 3 })
      .eq("id", id);
    if (!error) {
      localStorage.setItem(flaggedKey, "true");
      fetchListings();
    }
  }

  function priceText(item) {
    if (item.price_on_request) return t.priceOnRequest;
    if (item.price) {
      const base = `R${Number(item.price).toLocaleString("en-ZA")}`;
      return item.listing_type === "rent" ? `${base}${t.perMonth}` : base;
    }
    return null;
  }

  // Only show property-type pills for types that actually have listings
  const presentProps = new Set(
    listings.map((l) => findPropertyType(l.property_type)?.value).filter(Boolean)
  );
  const filterProps = PROPERTY_TYPES.filter((c) => presentProps.has(c.value));

  // Taken items sink to the bottom; order otherwise stays newest-first
  const visible = listings
    .filter((l) => typeFilter === "all" || l.listing_type === typeFilter)
    .filter((l) => propFilter === "all" || findPropertyType(l.property_type)?.value === propFilter)
    .sort((a, b) => Number(!!a.is_taken) - Number(!!b.is_taken));

  const inputClass =
    "w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-sky-500";

  const pillClass = (active) =>
    `px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
      active
        ? "bg-sky-500 border-sky-500 text-black font-semibold"
        : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
    }`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <header
        className="border-b border-sky-900/60 px-4 pt-6 pb-6"
        style={{
          background: "radial-gradient(circle at 20% 0%, #0c4a6e, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              🏠 <span className="text-sky-400">{t.title}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{t.sub}</p>
          </div>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-sky-400 hover:text-sky-400 transition flex-shrink-0"
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
            <Link href="/privacy" className="underline hover:text-sky-400">
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
              : "bg-sky-500 hover:bg-sky-600 text-black"
          }`}
        >
          {showForm ? t.cancel : t.postBtn}
        </button>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 border border-sky-500/30 rounded-2xl p-5 mb-6 space-y-3"
          >
            {/* Rent / Sale toggle */}
            <div className="grid grid-cols-2 gap-2">
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setListingType(lt.value)}
                  className={`rounded-lg py-3 text-sm font-semibold border transition ${
                    listingType === lt.value
                      ? "bg-sky-500 border-sky-500 text-black"
                      : "bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {lt.icon} {lt[lang]}
                </button>
              ))}
            </div>

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
              placeholder={t.listingTitle}
              maxLength={80}
              required
              className={inputClass}
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              {PROPERTY_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c[lang]}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t.area}
              maxLength={60}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
                aria-label={t.bedrooms}
              >
                <option value="">🛏️ {t.bedrooms} {t.anyOption}</option>
                <option value="0">0 (Studio / Room)</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
                aria-label={t.bathrooms}
              >
                <option value="">🚿 {t.bathrooms} {t.anyOption}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3+</option>
              </select>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.description}
              rows={3}
              maxLength={600}
              required
              className={inputClass}
            />

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
                placeholder={listingType === "rent" ? t.priceRent : t.priceSale}
                className={inputClass}
              />
            )}

            <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 hover:border-sky-500 transition rounded-lg px-4 py-3 cursor-pointer">
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
              className="w-full bg-sky-500 hover:bg-sky-600 text-black transition rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? t.posting : t.postListing}
            </button>
          </form>
        )}

        {/* Filters */}
        {!loading && listings.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setTypeFilter("all")} className={pillClass(typeFilter === "all")}>
                {t.all}
              </button>
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => setTypeFilter(lt.value)}
                  className={pillClass(typeFilter === lt.value)}
                >
                  {lt.icon} {lt[lang]}
                </button>
              ))}
            </div>

            {filterProps.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setPropFilter("all")} className={pillClass(propFilter === "all")}>
                  {t.allTypes}
                </button>
                {filterProps.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPropFilter(c.value)}
                    className={pillClass(propFilter === c.value)}
                  >
                    {c.icon} {c[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && <SkeletonList Component={SkeletonPostCard} count={3} />}

        {/* Listings */}
        <div className="space-y-4">
          {visible.map((item) => {
            const prop = findPropertyType(item.property_type);
            const lt = findListingType(item.listing_type);
            const priceStr = priceText(item);
            const isMine = myListings.includes(item.id);
            return (
              <article
                key={item.id}
                className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 ${
                  item.is_taken ? "opacity-50" : ""            }`}
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
                          {prop?.icon || "🏠"}
                        </div>
                      }
                    />
                  </div>
                )}

                <div className="flex justify-between items-start gap-3">
                  <h2 className="font-bold text-lg leading-tight break-words min-w-0">
                    {item.title}
                  </h2>
                  {item.is_taken ? (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex-shrink-0">
                      {item.listing_type === "sale" ? t.sold : t.rented}
                    </span>
                  ) : (
                    priceStr && (
                      <span className="text-sky-400 font-black text-lg flex-shrink-0 whitespace-nowrap">
                        {priceStr}
                      </span>
                    )
                  )}
                </div>

                {/* Quick facts */}
                {(item.area || item.bedrooms !== null || item.bathrooms !== null) && (
                  <p className="text-sm text-neutral-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {item.area && <span>📍 {item.area}</span>}
                    {item.bedrooms !== null && item.bedrooms !== undefined && (
                      <span>
                        🛏️ {item.bedrooms === 0 ? "Studio" : item.bedrooms >= 5 ? "5+" : item.bedrooms}
                        {item.bedrooms > 0 ? ` ${t.bedShort}` : ""}
                      </span>
                    )}
                    {item.bathrooms !== null && item.bathrooms !== undefined && (
                      <span>
                        🚿 {item.bathrooms >= 3 ? "3+" : item.bathrooms} {t.bathShort}
                      </span>
                    )}
                  </p>
                )}

                <p className="text-sm text-neutral-300 mt-2 leading-relaxed whitespace-pre-line break-words">
                  {item.description}
                </p>

                <div className="flex items-center flex-wrap gap-2 mt-3">
                  {lt && (
                    <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/40 rounded-full px-2.5 py-0.5">
                      {lt.icon} {lt[lang]}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-full px-2.5 py-0.5">
                    {prop ? `${prop.icon} ${prop[lang]}` : item.property_type}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {t.by} {item.name} · {timeAgo(item.created_at, lang)}
                  </span>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap items-center">
                  {!item.is_taken && (
                    <a
                      href={waLink(item.whatsapp, t.whatsappMsg(item.title))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 transition text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      {t.whatsappBtn}
                    </a>
                  )}
                  {isMine && !item.is_taken && (
                    <button
                      onClick={() => markTaken(item)}
                      className="text-sm text-neutral-400 hover:text-white border border-neutral-700 px-4 py-2 rounded-lg"
                    >
                      {item.listing_type === "sale" ? t.markSold : t.markRented}
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
            <div className="text-5xl mb-3">🏠</div>
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

