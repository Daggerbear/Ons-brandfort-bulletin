"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function Shoutouts() {
  const [lang, setLang] = useState("af");
  const [shoutouts, setShoutouts] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    af: {
      title1: "Brandfort",
      title2: "Shoutouts",
      tagline: "Verjaardae, dankie-boodskappe, of net iets lekkers om te sê.",
      namePlaceholder: "Jou naam",
      messagePlaceholder: "Jou boodskap...",
      submit: "Plaas",
      submitting: "Stuur...",
      flag: "Flag",
    },
    en: {
      title1: "Brandfort",
      title2: "Shoutouts",
      tagline: "Birthdays, thank-you messages, or just something nice to say.",
      namePlaceholder: "Your name",
      messagePlaceholder: "Your message...",
      submit: "Post",
      submitting: "Sending...",
      flag: "Flag",
    },
  };
  const t = text[lang];

  const loadShoutouts = async () => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data } = await supabase
      .from("shoutouts")
      .select("*")
      .lt("flag_count", 3)
      .gte("created_at", fourteenDaysAgo.toISOString())
      .order("created_at", { ascending: false });
    setShoutouts(data || []);
  };

  useEffect(() => {
    loadShoutouts();
  }, []);

  const submitShoutout = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setLoading(true);
    await supabase.from("shoutouts").insert({ name, message });
    setName("");
    setMessage("");
    setLoading(false);
    loadShoutouts();
  };

  const flagShoutout = async (id, currentCount) => {
    await supabase
      .from("shoutouts")
      .update({ flag_count: currentCount + 1 })
      .eq("id", id);
    loadShoutouts();
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
          onSubmit={submitShoutout}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8 space-y-3"
        >
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            required
          />
          <textarea
            placeholder={t.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            rows={3}
            required
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
          {shoutouts.map((s) => (
            <div
              key={s.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
            >
              <p className="text-neutral-300">{s.message}</p>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-neutral-500">— {s.name}</p>
                <button
                  onClick={() => flagShoutout(s.id, s.flag_count)}
                  className="text-xs text-neutral-500 hover:text-orange-400"
                >
                  {t.flag}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}