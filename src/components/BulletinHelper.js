// src/components/BulletinHelper.js
"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getReply, getGreeting, BOT_NAME } from "@/lib/botBrain";
import { trackEvent } from "@/lib/analytics";
import { QUICK_TAGS, TEXT, findMenuItems } from "@/components/helper/helperData";
import { EventCard, BusinessCard, MenuHitRow } from "@/components/helper/HelperCards";

export default function BulletinHelper() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("af");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const bottomRef = useRef(null);
  const loadRef = useRef(null);
  const dataRef = useRef({ businesses: [], knowledge: [], events: null, menu: {} });

  const t = TEXT[lang];

  // Pages where the floating button would get in the way
  const hidden =
    pathname === "/vind" ||
    (pathname || "").startsWith("/games/") ||
    (pathname || "").startsWith("/admin");

  // remember the language she was last used in
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bulletin_helper_lang");
      if (saved === "af" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  // a gentle "need a hand?" once per visit
  useEffect(() => {
    if (hidden) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("bulletin_helper_hint") === "1";
    } catch {}
    if (seen) return;
    const show = setTimeout(() => {
      setShowHint(true);
      try {
        sessionStorage.setItem("bulletin_helper_hint", "1");
      } catch {}
    }, 5000);
    const hide = setTimeout(() => setShowHint(false), 15000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [hidden]);

  // load what she needs only once she is opened (keeps every other page fast)
  useEffect(() => {
    if (!open || loadRef.current) return;
    loadRef.current = (async () => {
      const [bizRes, knRes, evRes, menuRes] = await Promise.all([
        supabase
          .from("businesses")
          .select("*")
          .eq("Status", "approved")
          .order("created_at", { ascending: false }),
        supabase.from("bot_knowledge").select("*").eq("active", true),
        supabase
          .from("events")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        supabase.from("business_menu_settings").select("business_id, menu_enabled, menu_mode"),
      ]);

      const menu = {};
      (menuRes.data || []).forEach((m) => {
        if (m.menu_enabled) menu[m.business_id] = m.menu_mode || "order";
      });

      dataRef.current = {
        businesses: bizRes.data || [],
        knowledge: knRes.data || [],
        events: evRes.error || !evRes.data ? null : evRes.data,
        menu,
      };
    })();
  }, [open]);

  // greeting
  useEffect(() => {
    setMessages((prev) => (prev.length <= 1 ? [] : prev));
  }, [lang]);
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ type: "bot", text: getGreeting(lang) }]);
    }
  }, [open, messages.length, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // lock page scroll behind the panel, Escape closes it
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hidden) return null;

  const logToTeam = (text) => {
    supabase.rpc("log_unanswered", { q: text }).then(
      () => {},
      () => {}
    );
  };

  const ask = async (query) => {
    const q = (query || "").trim();
    if (!q) return;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", text: q }]);
    trackEvent("search", { query: q, source: "helper" });

    try {
      await loadRef.current;
    } catch {}
    const { businesses, knowledge, events, menu } = dataRef.current;

    let reply = getReply({ query: q, lang, businesses, knowledge, events, menu });

    // also look on the menus (dishes, services) when this was a business search or a miss
    let menuHits = [];
    if (reply.results || reply.unanswered) {
      menuHits = await findMenuItems(q, businesses);
      if (reply.unanswered && menuHits.length > 0) {
        reply = { text: TEXT[lang].foundOnMenu };
      }
    }

    if (reply.unanswered) logToTeam(q);
    if (reply.logAs) logToTeam(reply.logAs);

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: reply.text,
        results: reply.results,
        events: reply.events,
        links: reply.links,
        menuHits,
        menu,
        query: q,
        askFeedback:
          !reply.unanswered &&
          (!!reply.results || !!reply.events || !!reply.links?.length || menuHits.length > 0),
      },
    ]);
  };

  const sendFeedback = (index, good) => {
    const m = messages[index];
    if (!m || m.feedback) return;
    if (!good) logToTeam(`[nie nuttig] ${m.query}`.slice(0, 200));
    setMessages((prev) =>
      prev.map((x, i) => (i === index ? { ...x, feedback: good ? "good" : "bad" } : x))
    );
  };

  const switchLang = () => {
    const next = lang === "af" ? "en" : "af";
    setLang(next);
    try {
      localStorage.setItem("bulletin_helper_lang", next);
    } catch {}
  };

  const bottomOffset = "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)";
  const close = () => setOpen(false);

  return (
    <>
      {/* Floating button */}
      {!open && (
        <>
          {showHint && (
            <button
              onClick={() => {
                setShowHint(false);
                setOpen(true);
              }}
              className="fixed right-4 z-40 bg-neutral-900 border border-orange-500/40 text-neutral-100 text-sm font-medium rounded-2xl rounded-br-sm px-4 py-2 shadow-lg"
              style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
            >
              {t.hint}
            </button>
          )}
          <button
            onClick={() => {
              setShowHint(false);
              setOpen(true);
            }}
            aria-label={t.open}
            className="fixed right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-lg shadow-orange-500/30 flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition"
            style={{ bottom: bottomOffset }}
          >
            💬
          </button>
        </>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 sm:bg-transparent sm:pointer-events-none"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[24rem] h-[85dvh] max-h-[680px] sm:pointer-events-auto bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900/60">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-black font-black text-lg flex items-center justify-center flex-shrink-0">
                {BOT_NAME[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white leading-tight">{BOT_NAME}</p>
                <p className="text-xs text-neutral-400 truncate">{t.subtitle}</p>
              </div>
              <button
                onClick={switchLang}
                className="text-xs border border-neutral-700 rounded-full px-2.5 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition flex-shrink-0"
              >
                {t.switchTo}
              </button>
              <button
                onClick={close}
                aria-label={t.close}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <p className="text-xs text-neutral-500 leading-relaxed">{t.intro}</p>

              {messages.map((m, i) =>
                m.type === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="bg-orange-500 text-black font-medium rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] text-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[92%] w-full">
                      {m.text && (
                        <div className="inline-block bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-neutral-200 text-sm mb-2">
                          {m.text}
                        </div>
                      )}

                      {m.events && m.events.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {m.events.map((e) => (
                            <EventCard key={e.id} e={e} onNavigate={close} />
                          ))}
                        </div>
                      )}

                      {m.results && m.results.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {m.results.map((b) => (
                            <BusinessCard
                              key={b.id}
                              b={b}
                              menuMode={m.menu?.[b.id]}
                              t={t}
                              onNavigate={close}
                            />
                          ))}
                        </div>
                      )}

                      {m.menuHits && m.menuHits.length > 0 && (
                        <div className="space-y-1.5 mb-2">
                          {m.results && m.results.length > 0 && (
                            <p className="text-xs text-neutral-500">{t.onMenus}</p>
                          )}
                          {m.menuHits.map((h) => (
                            <MenuHitRow key={h.id} h={h} onNavigate={close} />
                          ))}
                        </div>
                      )}

                      {/* Page buttons */}
                      {m.links && m.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {m.links.map((l) => (
                            <Link
                              key={l.href + l.label}
                              href={l.href}
                              onClick={close}
                              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-full px-4 py-2"
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      {m.askFeedback && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                          {m.feedback === "good" && <span>{t.thanks}</span>}
                          {m.feedback === "bad" && <span>{t.reported}</span>}
                          {!m.feedback && (
                            <>
                              <span>{t.helpful}</span>
                              <button
                                onClick={() => sendFeedback(i, true)}
                                aria-label="👍"
                                className="px-2 py-0.5 rounded-full border border-neutral-700 hover:border-orange-500"
                              >
                                👍
                              </button>
                              <button
                                onClick={() => sendFeedback(i, false)}
                                aria-label="👎"
                                className="px-2 py-0.5 rounded-full border border-neutral-700 hover:border-orange-500"
                              >
                                👎
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs text-neutral-500 w-full">{t.tryTags}</span>
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag.en}
                      onClick={() => ask(tag[lang])}
                      className="text-sm bg-neutral-900 border border-neutral-800 hover:border-orange-500 hover:text-orange-400 transition rounded-full px-3.5 py-1.5 text-neutral-300"
                    >
                      {tag[lang]}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="border-t border-neutral-800 bg-neutral-950 px-3 pt-3"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2.5 text-base text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-full px-4 py-2.5 flex-shrink-0"
                >
                  {t.send}
                </button>
              </div>
              <p className="text-[11px] text-neutral-600 text-center mt-2">{t.privacy}</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
