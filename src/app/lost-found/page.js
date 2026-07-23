"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function LostFound() {
  const [lang, setLang] = useState("af");
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Verlore");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const text = {
    af: {
      title1: "Verlore",
      title2: "& Gevind",
      tagline: "Help mekaar om verlore items te vind.",
      lost: "Verlore",
      found: "Gevind",
      namePlaceholder: "Jou naam",
      titlePlaceholder: "Wat? (bv. Bruin hond, selfoon...)",
      descPlaceholder: "Beskrywing...",
      contactPlaceholder: "Kontak nommer",
      submit: "Plaas",
      submitting: "Stuur...",
    },
    en: {
      title1: "Lost",
      title2: "& Found",
      tagline: "Help each other find lost items.",
      lost: "Lost",
      found: "Found",
      namePlaceholder: "Your name",
      titlePlaceholder: "What? (e.g. Brown dog, phone...)",
      descPlaceholder: "Description...",
      contactPlaceholder: "Contact number",
      submit: "Post",
      submitting: "Sending...",
    },
  };
  const t = text[lang];

  const loadItems = async () => {
    const { data } = await supabase
      .from("lost_found")
      .select("*")
      .lt("flag_count", 3)
      .order("created_at", { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const submitItem = async (e) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    setLoading(true);

    let image_url = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("Lost-found-photos")
        .upload(fileName, file);

      if (uploadError) {
        alert("Foto oplaai het gefaal: " + uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("Lost-found-photos")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    await supabase.from("lost_found").insert({
      name,
      type,
      title,
      description,
      contact,
      image_url,
    });

    setName("");
    setTitle("");
    setDescription("");
    setContact("");
    setFile(null);
    setLoading(false);
    loadItems();
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-3xl font-bold">
          {t.title1} <span className="text-orange-500">{t.title2}</span>
        </h1>
        <p className="text-neutral-400 mt-2">{t.tagline}</p>
      </header>

      <section className="px-6 py-8 max-w-2xl mx-auto">
        <form
          onSubmit={submitItem}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8 space-y-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("Verlore")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                type === "Verlore"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {t.lost}
            </button>
            <button
              type="button"
              onClick={() => setType("Gevind")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                type === "Gevind"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {t.found}
            </button>
          </div>

          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            required
          />
          <input
            type="text"
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            required
          />
          <textarea
            placeholder={t.descPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            rows={3}
          />
          <input
            type="text"
            placeholder={t.contactPlaceholder}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-neutral-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-2"
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/lost-found/${item.id}`}
              className="flex gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-orange-500 transition"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
              )}
              <div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.type === "Verlore"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {item.type === "Verlore" ? t.lost : t.found}
                </span>
                <h3 className="text-lg font-semibold text-white mt-1">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400">— {item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}