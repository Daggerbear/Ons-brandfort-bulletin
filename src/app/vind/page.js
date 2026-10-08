// src/app/vind/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import Image from "next/image";
import { getReply, getGreeting } from "@/lib/botBrain";
import { trackEvent } from "@/lib/analytics";

const QUICK_TAGS = [
  { af: "Loodgieter", en: "Plumber" },
  { af: "Werktuigkundige", en: "Mechanic" },
  { af: "Kapper", en: "Hair Salon" },
  { af: "Elektrisiën", en: "Electrician" },
  { af: "Eetplek", en: "Restaurant" },
  { af: "Ek soek werk", en: "I'm looking for a job" },
  { af: "Ek wil iets verkoop", en: "I want to sell something" },
];

export default function VindDiens() {
  const [lang, setLang] = useState("af");
  const [businesses, setBusinesses] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const text = {
    af: {
      title: "🔎 Vind 'n Diens",
      subtitle: "Vra my enigiets oor Brandfort",
      placeholder: "bv. waar kan ek wol koop?",
      tryTags: "Probeer:",
      send: "Stuur",
    },
    en: {
      title: "🔎 Find a Service",
      subtitle: "Ask me anything about Brandfort",
      placeholder: "e.g. where can I buy wool?",
      tryTags: "Try:",
      send: "Send",
    },
  };
  const t = text[lang];

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("Status", "approved")
        .order("created_at", { ascending: false });
      setBusinesses(data || []);

      const { data: kn } = await supabase
        .from("bot_knowledge")
        .select("*")
        .eq("active", true);
      setKnowledge(kn || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    setMessages([{ type: "bot", text: getGreeting(lang) }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runSearch = (query) => {
    const q = query.trim();
    if (!q) return;

    trackEvent("search", { query: q });

    const reply = getReply({ query: q, lang, businesses, knowledge });

    if (reply.unanswered) {
      // Save the question so we know what to teach her. Never blocks the chat.
      supabase.rpc("log_unanswered", { q }).then(
        () => {},
        () => {}
      );
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text: q },
      {
        type: "bot",
        text: reply.text,
        results: reply.results,
        links: reply.links,
        query: q,
      },
    ]);
    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(input);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav lang={lang} />

      <header className="border-b border-neutral-800 px-6 py-5 text-center">
        <div className="flex justify-end mb-3 max-w-xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-neutral-400 mt-1 text-sm">{t.subtitle}</p>
      </header>

      {/* Message thread */}
      <section className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full space-y-4">
        {messages.map((m, i) =>
          m.type === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-orange-500 text-black font-medium rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[92%] w-full">
                {m.text && (
                  <div className="inline-block bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-neutral-200 text-sm mb-2">
                    💬 {m.text}
                  </div>
                )}

                {m.links && m.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-full px-4 py-2"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}

                {m.results && m.results.length > 0 && (
                  <div className="space-y-3">
                    {m.results.map((business) => (
                      <Link
                        key={business.id}
                        href={`/business/${business.id}`}
                        className="flex gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-orange-500 transition"
                      >
                        {business.logo_url ? (
                          <Image
                            src={business.logo_url}
                            alt={`${business.name} logo`}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-orange-400">
                            {business.name}
                          </h3>
                          <p className="text-xs text-neutral-400">{business.category}</p>
                          {business.services?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {business.services.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-neutral-400 mt-1.5">
                            📞 {business.contact}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-neutral-500 w-full">{t.tryTags}</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.en}
                onClick={() => runSearch(tag[lang])}
                className="text-sm bg-neutral-900 border border-neutral-800 hover:border-orange-500 hover:text-orange-400 transition rounded-full px-4 py-2 text-neutral-300"
              >
                {tag[lang]}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-800 bg-neutral-950 px-4 py-3 sticky bottom-0"
      >
        <div className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-3 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-full px-5 py-3 flex-shrink-0"
          >
            {t.send}
          </button>
        </div>
      </form>
    </main>
  );
}