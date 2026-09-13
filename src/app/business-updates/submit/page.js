"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const CATEGORIES = [
  { af: "Spesiaal", en: "Special" },
  { af: "Nuwe Voorraad", en: "New Stock" },
  { af: "Spyskaart", en: "Menu" },
  { af: "Aanbod", en: "Offer" },
  { af: "Aankondiging", en: "Announcement" },
];

export default function SubmitBusinessUpdate() {
  const [lang, setLang] = useState("af");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    business_id: "",
    contact_number: "",
    title: "",
    body: "",
    category: "",
  });

  useEffect(() => {
    const loadBusinesses = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("Status", "approved")
        .order("name", { ascending: true });
      setBusinesses(data || []);
    };
    loadBusinesses();
  }, []);

  const text = {
    af: {
      heading: "Plaas 'n Besigheidsopdatering",
      sub: "Deel spesiale aanbiedinge, nuwe voorraad, of nuus met die gemeenskap. Ons keur dit gou goed.",
      business: "Kies Jou Besigheid",
      businessPlaceholder: "-- Kies 'n besigheid --",
      noBusiness: "Sien jy nie jou besigheid nie? Maak eers seker dit is gelys en goedgekeur.",
      contact: "Jou Kontaknommer",
      contactHint: "Vir verifikasie — moet ooreenstem met jou besigheid se rekord",
      category: "Kategorie",
      title: "Titel",
      body: "Besonderhede",
      image: "Prent",
      imageHint: "Opsioneel — PNG, JPG of WEBP",
      submit: "Dien In",
      submitting: "Besig...",
      thanks: "Dankie! Jou opdatering wag nou vir goedkeuring.",
      back: "Terug na Opdaterings",
      required: "Kies asseblief 'n besigheid.",
    },
    en: {
      heading: "Post a Business Update",
      sub: "Share specials, new stock, or news with the community. We'll approve it soon.",
      business: "Choose Your Business",
      businessPlaceholder: "-- Select a business --",
      noBusiness: "Don't see your business? Make sure it's listed and approved first.",
      contact: "Your Contact Number",
      contactHint: "For verification — should match your business's record",
      category: "Category",
      title: "Title",
      body: "Details",
      image: "Image",
      imageHint: "Optional — PNG, JPG or WEBP",
      submit: "Submit",
      submitting: "Submitting...",
      thanks: "Thanks! Your update is now pending approval.",
      back: "Back to Updates",
      required: "Please choose a business.",
    },
  };

  const t = text[lang];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.business_id) {
      alert(t.required);
      return;
    }

    setUploading(true);

    let image_url = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business_update_images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Image upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("business_update_images")
        .getPublicUrl(fileName);

      image_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("business_updates").insert([
      {
        business_id: form.business_id,
        contact_number: form.contact_number,
        title: form.title,
        body: form.body,
        category: form.category,
        image_url: image_url,
      },
    ]);

    setUploading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10 flex flex-col">
      <Nav lang={lang} />
      <div className="max-w-md mx-auto mt-8 flex-1 w-full">
        <button
          onClick={() => setLang(lang === "af" ? "en" : "af")}
          className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition mb-8"
        >
          {lang === "af" ? "English" : "Afrikaans"}
        </button>

        {!submitted ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{t.heading}</h1>
            <p className="text-neutral-400 mb-6">{t.sub}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.business}
                </label>
                <select
                  name="business_id"
                  value={form.business_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                >
                  <option value="">{t.businessPlaceholder}</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-600 mt-1">{t.noBusiness}</p>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.contact}
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
                <p className="text-xs text-neutral-600 mt-1">{t.contactHint}</p>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.category}
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                >
                  <option value="">-</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {cat[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.title}
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.body}
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.image} <span className="text-neutral-600">({t.imageHint})</span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="w-full text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-semibold hover:file:bg-orange-600 file:cursor-pointer cursor-pointer"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-20 h-20 object-cover rounded-lg border border-neutral-800"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed transition text-white font-semibold rounded-lg px-4 py-3 mt-2"
              >
                {uploading ? t.submitting : t.submit}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-orange-400 mb-6">{t.thanks}</p>
            <Link href="/business-updates" className="text-neutral-400 hover:text-white underline">
              {t.back}
            </Link>
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}