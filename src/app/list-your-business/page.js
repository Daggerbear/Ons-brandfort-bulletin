// src/app/list-your-business/page.js
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const FORM_CATEGORIES = CATEGORIES.filter((c) => c.slug !== "all");

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Turn "Tyre fitting, engine repairs" into ["tyre fitting", "engine repairs"]
function parseServices(raw) {
  const seen = new Set();
  return (raw || "")
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase().slice(0, 40))
    .filter((s) => {
      if (!s || seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .slice(0, 10);
}

// Shrink logos to max 512px. Keeps PNG/WEBP transparency.
// Falls back to the original file if anything goes wrong or it wouldn't get smaller.
async function compressLogo(file, maxSize = 512, quality = 0.85) {
  try {
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const outType = EXT_BY_TYPE[file.type] ? file.type : "image/jpeg";
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, quality)
    );
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

export default function ListBusiness() {
  const [lang, setLang] = useState("af");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    services: "",
    contact: "",
    address: "",
    hours: "",
  });

  const text = {
    af: {
      heading: "Lys Jou Besigheid",
      sub: "Gratis, altyd. Vul die vorm in en ons keur dit gou goed.",
      name: "Besigheid Naam",
      category: "Kategorie",
      description: "Beskrywing",
      services: "Wat doen jy?",
      servicesHint: "Opsioneel",
      servicesPlaceholder: "Bv. bande pas, enjin herstel, sleepdiens",
      servicesHelp: "Skei met kommas. Dit help mense om jou te vind wanneer hulle soek.",
      contact: "Kontak Nommer",
      address: "Adres",
      addressHint: "Opsioneel",
      hours: "Ure",
      hoursHint: "Bv. Ma-Vr 8:00-17:00 (Opsioneel)",
      logo: "Logo",
      logoHint: "Opsioneel — PNG, JPG of WEBP",
      submit: "Dien In",
      submitting: "Besig...",
      thanks: "Dankie! Jou besigheid wag nou vir goedkeuring.",
      thanksSub: "Ons keur dit gou goed en dan verskyn dit op die Bulletin.",
      back: "Terug na Tuisblad",
      viewAll: "Kyk na Besighede",
      agree: "Deur in te dien, stem jy in tot ons",
      terms: "Bepalings & Voorwaardes",
      errorLogo: "Kon nie die logo oplaai nie. Probeer 'n ander prent, of los dit uit en probeer weer.",
      errorGeneric: "Iets het skeefgeloop. Probeer asseblief weer.",
    },
    en: {
      heading: "List Your Business",
      sub: "Free, always. Fill in the form and we'll approve it soon.",
      name: "Business Name",
      category: "Category",
      description: "Description",
      services: "What do you do?",
      servicesHint: "Optional",
      servicesPlaceholder: "E.g. tyre fitting, engine repairs, towing",
      servicesHelp: "Separate with commas. This helps people find you when they search.",
      contact: "Contact Number",
      address: "Address",
      addressHint: "Optional",
      hours: "Hours",
      hoursHint: "E.g. Mon-Fri 8am-5pm (Optional)",
      logo: "Logo",
      logoHint: "Optional — PNG, JPG or WEBP",
      submit: "Submit",
      submitting: "Submitting...",
      thanks: "Thanks! Your business is now pending approval.",
      thanksSub: "We'll approve it soon and then it appears on the Bulletin.",
      back: "Back to Homepage",
      viewAll: "View Businesses",
      agree: "By submitting, you agree to our",
      terms: "Terms & Conditions",
      errorLogo: "Couldn't upload the logo. Try a different image, or leave it out and try again.",
      errorGeneric: "Something went wrong. Please try again.",
    },
  };

  const t = text[lang];

  const parsedServices = parseServices(form.services);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg("");

    let logo_url = null;

    if (logoFile) {
      const uploadFile = await compressLogo(logoFile);
      const contentType = uploadFile.type || logoFile.type;
      const fileExt =
        EXT_BY_TYPE[contentType] || logoFile.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business_logos")
        .upload(fileName, uploadFile, { contentType });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        setErrorMsg(t.errorLogo);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("business_logos")
        .getPublicUrl(fileName);

      logo_url = publicUrlData.publicUrl;
    }

    const row = {
      name: form.name,
      category: form.category,
      description: form.description,
      contact: form.contact,
      address: form.address,
      hours: form.hours,
      logo_url: logo_url,
    };

    // Only send services if the owner filled them in
    if (parsedServices.length > 0) {
      row.services = parsedServices;
    }

    const { error } = await supabase.from("businesses").insert([row]);

    setUploading(false);

    if (error) {
      console.log("Error:", error);
      setErrorMsg(t.errorGeneric);
    } else {
      setSubmitted(true);
    }
  };

  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none";

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <header
        className="border-b border-orange-900/60 px-6 pt-6 pb-8"
        style={{
          background: "radial-gradient(circle at 20% 0%, #7c2d12, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-400 hover:text-orange-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            🏪 <span className="text-orange-400">{t.heading}</span>
          </h1>
          <p className="text-neutral-300 text-sm mt-2">{t.sub}</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 flex-1 w-full">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.name}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.category}</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">-</option>
                {FORM_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.icon} {cat[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.description}</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                {t.services} <span className="text-neutral-600">({t.servicesHint})</span>
              </label>
              <input
                type="text"
                name="services"
                value={form.services}
                onChange={handleChange}
                placeholder={t.servicesPlaceholder}
                className={`${inputClass} placeholder:text-neutral-600`}
              />
              <p className="text-xs text-neutral-500 mt-1">{t.servicesHelp}</p>
              {parsedServices.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parsedServices.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.contact}</label>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                {t.address} <span className="text-neutral-600">({t.addressHint})</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.hours}</label>
              <input
                type="text"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                placeholder={t.hoursHint}
                className={`${inputClass} placeholder:text-neutral-600`}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                {t.logo} <span className="text-neutral-600">({t.logoHint})</span>
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="w-full text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-semibold hover:file:bg-orange-600 file:cursor-pointer cursor-pointer"
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="mt-3 w-20 h-20 object-cover rounded-lg border border-neutral-800"
                />
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed transition text-white font-semibold rounded-lg px-4 py-3 mt-2"
            >
              {uploading ? t.submitting : t.submit}
            </button>

            <p className="text-xs text-neutral-500 text-center">
              {t.agree}{" "}
              <Link href="/terms" className="underline hover:text-orange-400">
                {t.terms}
              </Link>
              .
            </p>
          </form>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl text-orange-400 font-bold mb-2">{t.thanks}</p>
            <p className="text-sm text-neutral-400 mb-8">{t.thanksSub}</p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/besighede"
                className="inline-block bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-xl px-5 py-3 text-sm"
              >
                {t.viewAll}
              </Link>
              <a href="/" className="text-neutral-400 hover:text-white underline text-sm">
                {t.back}
              </a>
            </div>
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </main>
  );
}