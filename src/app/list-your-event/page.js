// src/app/list-your-event/page.js
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

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

export default function ListEvent() {
  const [lang, setLang] = useState("af");
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    submittedBy: "",
    whatsapp: "",
  });

  const text = {
    af: {
      heading: "Lys Jou Gebeurtenis",
      sub: "Gratis, altyd. Vul die vorm in en ons keur dit gou goed.",
      title: "Gebeurtenis Naam",
      date: "Datum",
      time: "Tyd",
      location: "Plek",
      description: "Beskrywing",
      submittedBy: "Jou Naam",
      whatsapp: "WhatsApp Nommer (bv. 0821234567)",
      photo: "Foto (opsioneel)",
      choosePhoto: "Kies foto",
      changePhoto: "Verander foto",
      removePhoto: "Verwyder",
      submit: "Dien In",
      submitting: "Stuur...",
      thanks: "Dankie! Jou gebeurtenis wag nou vir goedkeuring.",
      thanksSub: "Ons keur dit gou goed en dan verskyn dit op die Bulletin.",
      back: "Terug na Tuisblad",
      viewCommunity: "Kyk na Gemeenskap",
      agree: "Deur in te dien, stem jy in tot ons",
      terms: "Bepalings & Voorwaardes",
      errorPhoto: "Kon nie die foto oplaai nie. Probeer 'n ander foto, of verwyder dit en probeer weer.",
      errorGeneric: "Iets het skeefgeloop. Probeer asseblief weer.",
    },
    en: {
      heading: "List Your Event",
      sub: "Free, always. Fill in the form and we'll approve it soon.",
      title: "Event Name",
      date: "Date",
      time: "Time",
      location: "Location",
      description: "Description",
      submittedBy: "Your Name",
      whatsapp: "WhatsApp Number (e.g. 0821234567)",
      photo: "Photo (optional)",
      choosePhoto: "Choose photo",
      changePhoto: "Change photo",
      removePhoto: "Remove",
      submit: "Submit",
      submitting: "Sending...",
      thanks: "Thanks! Your event is now pending approval.",
      thanksSub: "We'll approve it soon and then it appears on the Bulletin.",
      back: "Back to Homepage",
      viewCommunity: "View Community",
      agree: "By submitting, you agree to our",
      terms: "Terms & Conditions",
      errorPhoto: "Couldn't upload the photo. Try a different photo, or remove it and try again.",
      errorGeneric: "Something went wrong. Please try again.",
    },
  };

  const t = text[lang];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const removePhoto = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let image_url = null;

    if (file) {
      const uploadFile = await compressPhoto(file);
      const compressed = uploadFile !== file;
      const fileExt = compressed ? "jpg" : file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("events-photos")
        .upload(
          fileName,
          uploadFile,
          compressed ? { contentType: "image/jpeg" } : undefined
        );

      if (uploadError) {
        console.log("Upload error:", uploadError);
        setErrorMsg(t.errorPhoto);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("events-photos")
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("events").insert([
      {
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        description: form.description,
        submittedBy: form.submittedBy,
        whatsapp: form.whatsapp,
        image_url,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log("Error:", error);
      setErrorMsg(t.errorGeneric);
    } else {
      setSubmitted(true);
    }
  };

  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none";

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <header
        className="border-b border-green-900/60 px-6 pt-6 pb-8"
        style={{
          background: "radial-gradient(circle at 20% 0%, #14532d, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLang(lang === "af" ? "en" : "af")}
              className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-green-400 hover:text-green-400 transition"
            >
              {lang === "af" ? "English" : "Afrikaans"}
            </button>
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            📅 <span className="text-green-400">{t.heading}</span>
          </h1>
          <p className="text-neutral-300 text-sm mt-2">{t.sub}</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 flex-1 w-full">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.title}</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.date}</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.time}</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.location}</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className={inputClass}
              />
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
              <label className="block text-sm text-neutral-400 mb-1">{t.submittedBy}</label>
              <input
                type="text"
                name="submittedBy"
                value={form.submittedBy}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.whatsapp}</label>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t.photo}</label>
              <label className="flex items-center justify-center gap-2 w-full bg-neutral-900 border border-neutral-800 hover:border-green-500 transition rounded-lg px-4 py-3 text-white cursor-pointer">
                📷 {file ? t.changePhoto : t.choosePhoto}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {preview && (
                <div className="mt-3 relative inline-block">
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
            </div>

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-neutral-700 disabled:cursor-not-allowed transition text-black font-semibold rounded-lg px-4 py-3 mt-2"
            >
              {loading ? t.submitting : t.submit}
            </button>

            <p className="text-xs text-neutral-500 text-center">
              {t.agree}{" "}
              <Link href="/terms" className="underline hover:text-green-400">
                {t.terms}
              </Link>
              .
            </p>
          </form>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl text-green-400 font-bold mb-2">{t.thanks}</p>
            <p className="text-sm text-neutral-400 mb-8">{t.thanksSub}</p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/community"
                className="inline-block bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-xl px-5 py-3 text-sm"
              >
                {t.viewCommunity}
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