"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = {
  af: ["Ander", "Voertuie", "Meubels", "Elektronika", "Klere", "Huishoudelik", "Gereedskap", "Vee"],
  en: ["Other", "Vehicles", "Furniture", "Electronics", "Clothing", "Household", "Tools", "Livestock"],
};

const text = {
  af: {
    title: "Koop & Verkoop",
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
    posting: "Plaas tans...",
    postListing: "Plaas Item",
    priceLabel: "—",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markSold: "Merk as Verkoop",
    sold: "VERKOOP",
    report: "🚩 Rapporteer",
    noListings: "Nog geen items nie. Wees die eerste!",
    loading: "Laai tans...",
    back: "← Bulletin",
    whatsappMsg: (title) => `Hi, ek het jou item "${title}" op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Classifieds",
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
    posting: "Posting...",
    postListing: "Post Listing",
    priceLabel: "—",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markSold: "Mark as Sold",
    sold: "SOLD",
    report: "🚩 Report",
    noListings: "No listings yet. Be the first!",
    loading: "Loading...",
    back: "← Bulletin",
    whatsappMsg: (title) => `Hi, I saw your listing "${title}" on Ons Brandfort Bulletin`,
  },
};

export default function Classifieds() {
  const [lang, setLang] = useState("af");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myListings, setMyListings] = useState([]);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [category, setCategory] = useState("Other");
  const [image, setImage] = useState(null);

  const t = text[lang];
  const categories = CATEGORIES[lang];

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !title.trim() || !description.trim()) return;
    setSubmitting(true);

    let image_url = null;
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("classifieds")
        .upload(fileName, image);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("classifieds")
          .getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
      }
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
      fetchListings();
    } else {
      alert("Something went wrong posting your listing.");
    }
  }

  async function markSold(id) {
    if (!confirm(lang === "af" ? "Merk hierdie item as verkoop?" : "Mark this listing as sold?")) return;
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

  return (
    <main className="min-h-screen bg-carbon text-white">
      <Nav lang={lang} />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-orange-400">{t.title}</h1>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <p className="text-neutral-500 text-sm mb-2">{t.disclaimer}</p>
        <p className="text-neutral-600 text-xs mb-6">
          {t.privacyNote}{" "}
          <a href="/privacy" className="underline hover:text-orange-400">
            {t.privacyLink}
          </a>.
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-orange-500 hover:bg-orange-600 transition rounded-xl py-3 font-semibold mb-6"
        >
          {showForm ? t.cancel : t.postBtn}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            />
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t.whatsapp}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.itemTitle}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.description}
              rows={3}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t.price}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              />
            )}

            <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 cursor-pointer">
              📷 {image ? image.name : t.addPhoto}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 transition rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? t.posting : t.postListing}
            </button>
          </form>
        )}

        {loading && <p className="text-neutral-500">{t.loading}</p>}

        <div className="space-y-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 ${item.is_sold ? "opacity-50" : ""}`}
            >
              {item.image_url && (
                <div className="relative w-full h-56 mb-3">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                {item.is_sold && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">{t.sold}</span>
                )}
              </div>
              <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
              <p className="text-orange-400 font-semibold mt-2">
                {item.price_on_request ? t.priceOnRequest : item.price ? `R${item.price}` : t.priceLabel}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{item.category} · {t.by} {item.name}</p>

              <div className="flex gap-3 mt-3 flex-wrap">
                {!item.is_sold && (
                  <a
                    href={`https://wa.me/27${item.whatsapp.replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(t.whatsappMsg(item.title))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 transition text-sm px-4 py-2 rounded-lg"
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
                  className="text-sm text-neutral-600 hover:text-red-400 ml-auto"
                >
                  {t.report}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && listings.length === 0 && (
          <p className="text-neutral-600 text-center mt-10">{t.noListings}</p>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}