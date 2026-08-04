"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const CATEGORIES = {
  af: ["Ander", "Huiswerk", "Plaaswerk", "Kleinhandel", "Ambagte", "Admin/Kantoor", "Gasvryheid", "Bestuur", "Sekuriteit"],
  en: ["Other", "Domestic Work", "Farm Work", "Retail", "Trades", "Admin/Office", "Hospitality", "Driving", "Security"],
};

const text = {
  af: {
    title: "Werk",
    disclaimer: "Kontak direk via WhatsApp — Bulletin is nie betrokke by aanstellingsbesluite of ooreenkomste nie.",
    privacyNote: "Deur te plaas, stem jy in tot ons",
    privacyLink: "privaatheidsbeleid",
    tabJob: "💼 Vakatures",
    tabSeeker: "🙋 Soek Werk",
    postJob: "+ Plaas 'n Vakature",
    postSeeker: "+ Plaas Beskikbaarheid",
    cancel: "Kanselleer",
    name: "Jou naam",
    whatsapp: "WhatsApp nommer (bv. 0821234567)",
    jobTitlePlaceholder: "Werktitel (bv. Kassier benodig)",
    seekerTitlePlaceholder: "Watter werk soek jy?",
    jobDescPlaceholder: "Werksbesonderhede, ure, vereistes...",
    seekerDescPlaceholder: "Jou ervaring, beskikbaarheid...",
    posting: "Plaas tans...",
    postingJob: "Plaas Vakature",
    postingSeeker: "Plaas Beskikbaarheid",
    by: "deur",
    whatsappBtn: "💬 WhatsApp",
    markFilledJob: "Merk as Gevul",
    markFilledSeeker: "Merk as Onbeskikbaar",
    filled: "GEVUL",
    unavailable: "ONBESKIKBAAR",
    report: "🚩 Rapporteer",
    noJobs: "Nog geen vakatures nie.",
    noSeekers: "Niemand het nog beskikbaarheid gelys nie.",
    loading: "Laai tans...",
    confirmJob: "Merk hierdie werk as gevul?",
    confirmSeeker: "Merk jouself as nie meer beskikbaar nie?",
    whatsappMsg: (title) => `Hi, ek het jou "${title}" plasing op Ons Brandfort Bulletin gesien`,
  },
  en: {
    title: "Jobs",
    disclaimer: "Connect directly via WhatsApp — Bulletin isn't involved in hiring decisions or agreements.",
    privacyNote: "By posting, you agree to our",
    privacyLink: "privacy policy",
    tabJob: "💼 Job Openings",
    tabSeeker: "🙋 Looking for Work",
    postJob: "+ Post a Job",
    postSeeker: "+ Post Availability",
    cancel: "Cancel",
    name: "Your name",
    whatsapp: "WhatsApp number (e.g. 0821234567)",
    jobTitlePlaceholder: "Job title (e.g. Cashier needed)",
    seekerTitlePlaceholder: "What work are you looking for?",
    jobDescPlaceholder: "Job details, hours, requirements...",
    seekerDescPlaceholder: "Your experience, availability...",
    posting: "Posting...",
    postingJob: "Post Job",
    postingSeeker: "Post Availability",
    by: "by",
    whatsappBtn: "💬 WhatsApp",
    markFilledJob: "Mark as Filled",
    markFilledSeeker: "Mark as Unavailable",
    filled: "FILLED",
    unavailable: "UNAVAILABLE",
    report: "🚩 Report",
    noJobs: "No job openings yet.",
    noSeekers: "No one's listed availability yet.",
    loading: "Loading...",
    confirmJob: "Mark this job as filled?",
    confirmSeeker: "Mark yourself as no longer available?",
    whatsappMsg: (title) => `Hi, I saw your "${title}" listing on Ons Brandfort Bulletin`,
  },
};

export default function Jobs() {
  const [lang, setLang] = useState("af");
  const [activeTab, setActiveTab] = useState("job");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myListings, setMyListings] = useState([]);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");

  const t = text[lang];
  const categories = CATEGORIES[lang];

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !title.trim() || !description.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        type: activeTab,
        title: title.trim(),
        description: description.trim(),
        category,
      })
      .select()
      .single();

    setSubmitting(false);

    if (!error && data) {
      const updated = [...myListings, data.id];
      localStorage.setItem("myJobListings", JSON.stringify(updated));
      setMyListings(updated);
      setShowForm(false);
      setName("");
      setWhatsapp("");
      setTitle("");
      setDescription("");
      setCategory("Other");
      fetchListings();
    } else {
      alert("Something went wrong posting your listing.");
    }
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

  const filtered = listings.filter((l) => l.type === activeTab);

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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab("job"); setShowForm(false); }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === "job" ? "bg-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            {t.tabJob}
          </button>
          <button
            onClick={() => { setActiveTab("seeker"); setShowForm(false); }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === "seeker" ? "bg-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            {t.tabSeeker}
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-neutral-800 hover:bg-neutral-700 transition rounded-xl py-3 font-semibold mb-6 border border-neutral-700"
        >
          {showForm ? t.cancel : activeTab === "job" ? t.postJob : t.postSeeker}
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
              placeholder={activeTab === "job" ? t.jobTitlePlaceholder : t.seekerTitlePlaceholder}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeTab === "job" ? t.jobDescPlaceholder : t.seekerDescPlaceholder}
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 transition rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? t.posting : activeTab === "job" ? t.postingJob : t.postingSeeker}
            </button>
          </form>
        )}

        {loading && <p className="text-neutral-500">{t.loading}</p>}

        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 ${item.is_filled ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                {item.is_filled && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    {activeTab === "job" ? t.filled : t.unavailable}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
              <p className="text-xs text-neutral-500 mt-2">{item.category} · {t.by} {item.name}</p>

              <div className="flex gap-3 mt-3 flex-wrap">
                {!item.is_filled && (
                  <a
                    href={`https://wa.me/27${item.whatsapp.replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(t.whatsappMsg(item.title))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 transition text-sm px-4 py-2 rounded-lg"
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
                  className="text-sm text-neutral-600 hover:text-red-400 ml-auto"
                >
                  {t.report}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-neutral-600 text-center mt-10">
            {activeTab === "job" ? t.noJobs : t.noSeekers}
          </p>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}