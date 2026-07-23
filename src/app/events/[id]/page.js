"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function EventDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const text = {
    af: { back: "← Terug na Tuisblad", loading: "Laai...", notFound: "Gebeurtenis nie gevind nie." },
    en: { back: "← Back to Homepage", loading: "Loading...", notFound: "Event not found." },
  };
  const t = text[lang];

  useEffect(() => {
    const loadEvent = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id).single();
      setEvent(data);
      setLoading(false);
    };
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Nav lang={lang} />
        <div className="px-6 py-10 text-center text-neutral-400">{t.loading}</div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Nav lang={lang} />
        <div className="px-6 py-10 text-center text-neutral-400">{t.notFound}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">{t.back}</Link>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-4">
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-full max-h-[500px] object-contain bg-black" />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-neutral-400 mt-2">{event.date} • {event.time}</p>
            <p className="text-sm text-neutral-400">{event.location}</p>
            <p className="text-neutral-300 mt-4">{event.description}</p>
            <p className="text-sm text-neutral-500 mt-4">— {event.submittedBy}</p>
          </div>
        </div>
      </section>
    </main>
  );
}