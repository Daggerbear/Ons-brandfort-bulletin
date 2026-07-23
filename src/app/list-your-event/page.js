"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function ListEvent() {
  const [lang, setLang] = useState("af");
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    submittedBy: "",
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
      photo: "Foto (opsioneel)",
      submit: "Dien In",
      submitting: "Stuur...",
      thanks: "Dankie! Jou gebeurtenis wag nou vir goedkeuring.",
      back: "Terug na Tuisblad",
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
      photo: "Photo (optional)",
      submit: "Submit",
      submitting: "Sending...",
      thanks: "Thanks! Your event is now pending approval.",
      back: "Back to Homepage",
    },
  };

  const t = text[lang];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image_url = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("events-photos")
        .upload(fileName, file);

      if (uploadError) {
        alert("Foto oplaai het gefaal: " + uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("events-photos")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("events").insert([
      {
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        description: form.description,
        submittedBy: form.submittedBy,
        image_url,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log("Error:", error);
      alert("Something went wrong, try again.");
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
                <label className="block text-sm text-neutral-400 mb-1">{t.title}</label>
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
                <label className="block text-sm text-neutral-400 mb-1">{t.date}</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">{t.photo}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3 mt-2"
              >
                {loading ? t.submitting : t.submit}
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