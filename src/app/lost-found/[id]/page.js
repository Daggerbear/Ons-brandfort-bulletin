"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function LostFoundDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const text = {
    af: {
      back: "← Terug na Verlore & Gevind",
      loading: "Laai...",
      notFound: "Item nie gevind nie.",
      lost: "Verlore",
      found: "Gevind",
      whatsapp: "Kontak op WhatsApp",
    },
    en: {
      back: "← Back to Lost & Found",
      loading: "Loading...",
      notFound: "Item not found.",
      lost: "Lost",
      found: "Found",
      whatsapp: "Contact on WhatsApp",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadItem = async () => {
      const { data } = await supabase
        .from("lost_found")
        .select("*")
        .eq("id", id)
        .single();
      setItem(data);
      setLoading(false);
    };
    loadItem();
  }, [id]);

  const whatsappLink = (contact) => {
    if (!contact) return null;
    let cleaned = contact.replace(/[\s-]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "27" + cleaned.slice(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Nav lang={lang} />
        <div className="px-6 py-10 text-center text-neutral-400">
          {t.loading}
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Nav lang={lang} />
        <div className="px-6 py-10 text-center text-neutral-400">
          {t.notFound}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <Link
            href="/lost-found"
            className="text-sm text-orange-400 hover:text-orange-300"
          >
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-4">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full max-h-[500px] object-contain bg-black"
            />
          )}

          <div className="p-6">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                item.type === "Verlore"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {item.type === "Verlore" ? t.lost : t.found}
            </span>

            <h1 className="text-2xl font-bold mt-3">{item.title}</h1>
            <p className="text-sm text-neutral-500 mt-1">— {item.name}</p>

            {item.description && (
              <p className="text-neutral-300 mt-4">{item.description}</p>
            )}

            {item.contact && (
              <>
                <p className="text-neutral-300 mt-4">📞 {item.contact}</p>
                <a
                  href={whatsappLink(item.contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg px-4 py-3"
                >
                  💬 {t.whatsapp}
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}