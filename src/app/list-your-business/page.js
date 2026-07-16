"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function ListBusiness() {
  const [lang, setLang] = useState("af");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
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
      back: "Terug na Tuisblad",
    },
    en: {
      heading: "List Your Business",
      sub: "Free, always. Fill in the form and we'll approve it soon.",
      name: "Business Name",
      category: "Category",
      description: "Description",
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
      back: "Back to Homepage",
    },
  };

  const t = text[lang];

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

    let logo_url = null;

    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business_logos")
        .upload(fileName, logoFile);

      if (uploadError) {
        console.log("Upload error:", uploadError);
        alert("Logo upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("business_logos")
        .getPublicUrl(fileName);

      logo_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("businesses").insert([
      {
        name: form.name,
        category: form.category,
        description: form.description,
        contact: form.contact,
        address: form.address,
        hours: form.hours,
        logo_url: logo_url,
      },
    ]);

    setUploading(false);

    if (error) {
      console.log("Error:", error);
      alert("Error: " + error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <Nav lang={lang} />
      <div className="max-w-md mx-auto mt-8">
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
                  {t.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
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
                  <option value="Agriculture">Agriculture</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Beauty & Spa">Beauty & Spa</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Health & Medical">Health & Medical</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Retail & Shopping">Retail & Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.description}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.contact}
                </label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t.hours}
                </label>
                <input
                  type="text"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder={t.hoursHint}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none placeholder:text-neutral-600"
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
            <a href="/" className="text-neutral-400 hover:text-white underline">
              {t.back}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}